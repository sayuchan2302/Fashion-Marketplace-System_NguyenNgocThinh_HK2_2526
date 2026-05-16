package vn.edu.hcmuaf.fit.marketplace.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailSendException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;
import vn.edu.hcmuaf.fit.marketplace.config.PasswordResetProperties;
import vn.edu.hcmuaf.fit.marketplace.dto.request.ForgotPasswordRequest;
import vn.edu.hcmuaf.fit.marketplace.dto.request.ResetPasswordRequest;
import vn.edu.hcmuaf.fit.marketplace.entity.PasswordResetToken;
import vn.edu.hcmuaf.fit.marketplace.entity.User;
import vn.edu.hcmuaf.fit.marketplace.repository.PasswordResetTokenRepository;
import vn.edu.hcmuaf.fit.marketplace.repository.UserRepository;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private CapturingEmailService emailService;
    private StubRateLimiter rateLimiter;
    private PasswordResetService service;
    private LocalDateTime now;

    @BeforeEach
    void setUp() {
        PasswordResetProperties properties = new PasswordResetProperties();
        properties.setFrontendBaseUrl("http://localhost:5173");
        properties.setTokenTtlMinutes(30);
        Clock clock = Clock.fixed(Instant.parse("2026-05-16T10:00:00Z"), ZoneId.of("UTC"));
        now = LocalDateTime.now(clock);
        emailService = new CapturingEmailService();
        rateLimiter = new StubRateLimiter();
        service = new PasswordResetService(
                userRepository,
                tokenRepository,
                emailService,
                rateLimiter,
                properties,
                passwordEncoder,
                new SecureRandom(),
                clock
        );
    }

    @Test
    void requestResetCreatesHashedTokenAndSendsEmailForActiveUser() {
        User user = buildUser(true);
        when(userRepository.findByEmailIgnoreCase("customer@test.local")).thenReturn(Optional.of(user));
        when(tokenRepository.save(any(PasswordResetToken.class))).thenAnswer(invocation -> {
            PasswordResetToken token = invocation.getArgument(0);
            token.setId(UUID.randomUUID());
            return token;
        });

        service.requestReset(new ForgotPasswordRequest("CUSTOMER@Test.Local"), "127.0.0.1");

        ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(tokenRepository).markUnusedTokensAsUsed(user.getId(), now);
        verify(tokenRepository).save(tokenCaptor.capture());

        String rawToken = extractToken(emailService.resetLink);
        PasswordResetToken saved = tokenCaptor.getValue();
        assertEquals(user, saved.getUser());
        assertEquals(64, saved.getTokenHash().length());
        assertEquals(service.hashToken(rawToken), saved.getTokenHash());
        assertNotEquals(rawToken, saved.getTokenHash());
        assertEquals(user, emailService.user);
        assertEquals(now.plusMinutes(30), emailService.expiresAt);
        assertTrue(emailService.resetLink.startsWith("http://localhost:5173/reset-password?token="));
    }

    @Test
    void requestResetKeepsNeutralResponseWhenEmailFails() {
        User user = buildUser(true);
        emailService.fail = true;
        when(userRepository.findByEmailIgnoreCase("customer@test.local")).thenReturn(Optional.of(user));
        when(tokenRepository.save(any(PasswordResetToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertDoesNotThrow(() -> service.requestReset(new ForgotPasswordRequest("customer@test.local"), "127.0.0.1"));

        ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(tokenRepository).save(tokenCaptor.capture());
        assertEquals(now, tokenCaptor.getValue().getUsedAt());
        assertEquals(1, emailService.sendCount);
    }

    @Test
    void requestResetDoesNotRevealUnknownEmail() {
        when(userRepository.findByEmailIgnoreCase("missing@test.local")).thenReturn(Optional.empty());

        service.requestReset(new ForgotPasswordRequest("missing@test.local"), "127.0.0.1");

        verify(tokenRepository, never()).save(any());
        assertEquals(0, emailService.sendCount);
    }

    @Test
    void requestResetDoesNotSendEmailForInactiveUser() {
        User user = buildUser(false);
        when(userRepository.findByEmailIgnoreCase("customer@test.local")).thenReturn(Optional.of(user));

        service.requestReset(new ForgotPasswordRequest("customer@test.local"), "127.0.0.1");

        verify(tokenRepository, never()).save(any());
        assertEquals(0, emailService.sendCount);
    }

    @Test
    void requestResetRejectsWhenRateLimitIsExceeded() {
        rateLimiter.allowed = false;

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> service.requestReset(new ForgotPasswordRequest("customer@test.local"), "127.0.0.1")
        );

        assertEquals(HttpStatus.TOO_MANY_REQUESTS, ex.getStatusCode());
        verifyNoInteractions(userRepository, tokenRepository);
        assertEquals(0, emailService.sendCount);
    }

    @Test
    void resetPasswordConsumesValidTokenAndUpdatesPassword() {
        User user = buildUser(true);
        PasswordResetToken token = buildToken(user, "valid-token", now.plusMinutes(10), null);
        when(tokenRepository.findByTokenHash(service.hashToken("valid-token"))).thenReturn(Optional.of(token));
        when(passwordEncoder.matches("new-password", "encoded-old")).thenReturn(false);
        when(passwordEncoder.encode("new-password")).thenReturn("encoded-new");

        service.resetPassword(new ResetPasswordRequest("valid-token", "new-password"));

        assertEquals("encoded-new", user.getPassword());
        assertEquals(now, token.getUsedAt());
        verify(tokenRepository).markOtherUnusedTokensAsUsed(user.getId(), token.getId(), now);
        verify(userRepository).save(user);
    }

    @Test
    void resetPasswordRejectsMissingToken() {
        when(tokenRepository.findByTokenHash(service.hashToken("bad-token"))).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> service.resetPassword(new ResetPasswordRequest("bad-token", "new-password"))
        );

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    void resetPasswordRejectsExpiredToken() {
        User user = buildUser(true);
        PasswordResetToken token = buildToken(user, "expired-token", now.minusMinutes(1), null);
        when(tokenRepository.findByTokenHash(service.hashToken("expired-token"))).thenReturn(Optional.of(token));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> service.resetPassword(new ResetPasswordRequest("expired-token", "new-password"))
        );

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    void resetPasswordRejectsUsedToken() {
        User user = buildUser(true);
        PasswordResetToken token = buildToken(user, "used-token", now.plusMinutes(10), now.minusMinutes(1));
        when(tokenRepository.findByTokenHash(service.hashToken("used-token"))).thenReturn(Optional.of(token));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> service.resetPassword(new ResetPasswordRequest("used-token", "new-password"))
        );

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    void resetPasswordRejectsSamePassword() {
        User user = buildUser(true);
        PasswordResetToken token = buildToken(user, "valid-token", now.plusMinutes(10), null);
        when(tokenRepository.findByTokenHash(service.hashToken("valid-token"))).thenReturn(Optional.of(token));
        when(passwordEncoder.matches("same-password", "encoded-old")).thenReturn(true);

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> service.resetPassword(new ResetPasswordRequest("valid-token", "same-password"))
        );

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertEquals("encoded-old", user.getPassword());
    }

    private User buildUser(boolean isActive) {
        return User.builder()
                .id(UUID.randomUUID())
                .email("customer@test.local")
                .password("encoded-old")
                .name("Customer")
                .isActive(isActive)
                .build();
    }

    private PasswordResetToken buildToken(
            User user,
            String rawToken,
            LocalDateTime expiresAt,
            LocalDateTime usedAt
    ) {
        return PasswordResetToken.builder()
                .id(UUID.randomUUID())
                .user(user)
                .tokenHash(service.hashToken(rawToken))
                .expiresAt(expiresAt)
                .usedAt(usedAt)
                .build();
    }

    private String extractToken(String link) {
        String query = link.substring(link.indexOf('?') + 1);
        assertTrue(query.startsWith("token="));
        String encodedToken = query.substring("token=".length());
        String rawToken = URLDecoder.decode(encodedToken, StandardCharsets.UTF_8);
        assertFalse(rawToken.isBlank());
        return rawToken;
    }

    private static final class CapturingEmailService extends PasswordResetEmailService {
        private User user;
        private String resetLink;
        private LocalDateTime expiresAt;
        private int sendCount;
        private boolean fail;

        private CapturingEmailService() {
            super(null, new PasswordResetProperties());
        }

        @Override
        public void sendPasswordResetEmail(User user, String resetLink, LocalDateTime expiresAt) {
            this.user = user;
            this.resetLink = resetLink;
            this.expiresAt = expiresAt;
            this.sendCount++;
            if (fail) {
                throw new MailSendException("SMTP unavailable");
            }
        }
    }

    private static final class StubRateLimiter extends PasswordResetRateLimiter {
        private boolean allowed = true;

        private StubRateLimiter() {
            super(new PasswordResetProperties(), Clock.systemUTC());
        }

        @Override
        public boolean allow(String email, String clientIp) {
            return allowed;
        }
    }
}
