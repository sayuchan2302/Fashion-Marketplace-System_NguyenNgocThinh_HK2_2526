package vn.edu.hcmuaf.fit.marketplace.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import vn.edu.hcmuaf.fit.marketplace.config.PasswordResetProperties;
import vn.edu.hcmuaf.fit.marketplace.dto.request.ForgotPasswordRequest;
import vn.edu.hcmuaf.fit.marketplace.dto.request.ResetPasswordRequest;
import vn.edu.hcmuaf.fit.marketplace.entity.PasswordResetToken;
import vn.edu.hcmuaf.fit.marketplace.entity.User;
import vn.edu.hcmuaf.fit.marketplace.repository.PasswordResetTokenRepository;
import vn.edu.hcmuaf.fit.marketplace.repository.UserRepository;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;

@Service
public class PasswordResetService {

    private static final Logger logger = LoggerFactory.getLogger(PasswordResetService.class);
    private static final int TOKEN_BYTES = 32;

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordResetEmailService emailService;
    private final PasswordResetRateLimiter rateLimiter;
    private final PasswordResetProperties properties;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom;
    private final Clock clock;

    @Autowired
    public PasswordResetService(
            UserRepository userRepository,
            PasswordResetTokenRepository tokenRepository,
            PasswordResetEmailService emailService,
            PasswordResetRateLimiter rateLimiter,
            PasswordResetProperties properties,
            PasswordEncoder passwordEncoder
    ) {
        this(
                userRepository,
                tokenRepository,
                emailService,
                rateLimiter,
                properties,
                passwordEncoder,
                new SecureRandom(),
                Clock.systemDefaultZone()
        );
    }

    PasswordResetService(
            UserRepository userRepository,
            PasswordResetTokenRepository tokenRepository,
            PasswordResetEmailService emailService,
            PasswordResetRateLimiter rateLimiter,
            PasswordResetProperties properties,
            PasswordEncoder passwordEncoder,
            SecureRandom secureRandom,
            Clock clock
    ) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
        this.rateLimiter = rateLimiter;
        this.properties = properties;
        this.passwordEncoder = passwordEncoder;
        this.secureRandom = secureRandom;
        this.clock = clock;
    }

    @Transactional
    public void requestReset(ForgotPasswordRequest request, String clientIp) {
        String email = normalizeEmail(request.getEmail());
        if (!rateLimiter.allow(email, clientIp)) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Too many password reset requests. Please try again later."
            );
        }

        userRepository.findByEmailIgnoreCase(email)
                .filter(user -> Boolean.TRUE.equals(user.getIsActive()))
                .ifPresent(this::createAndSendResetToken);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String tokenHash = hashToken(request.getToken().trim());
        PasswordResetToken resetToken = tokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(this::invalidToken);
        LocalDateTime now = LocalDateTime.now(clock);

        if (isInvalid(resetToken, now)) {
            throw invalidToken();
        }

        User user = resetToken.getUser();
        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw invalidToken();
        }
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must differ from current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        resetToken.setUsedAt(now);
        if (resetToken.getId() != null) {
            tokenRepository.markOtherUnusedTokensAsUsed(user.getId(), resetToken.getId(), now);
        } else {
            tokenRepository.markUnusedTokensAsUsed(user.getId(), now);
        }
        userRepository.save(user);
    }

    String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is not available", ex);
        }
    }

    private void createAndSendResetToken(User user) {
        LocalDateTime now = LocalDateTime.now(clock);
        tokenRepository.markUnusedTokensAsUsed(user.getId(), now);

        String rawToken = generateToken();
        LocalDateTime expiresAt = now.plusMinutes(Math.max(1, properties.getTokenTtlMinutes()));
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .tokenHash(hashToken(rawToken))
                .expiresAt(expiresAt)
                .build();
        tokenRepository.save(resetToken);

        try {
            emailService.sendPasswordResetEmail(user, buildResetLink(rawToken), expiresAt);
        } catch (MailException ex) {
            resetToken.setUsedAt(now);
            logger.warn(
                    "Failed to send password reset email for userId={}, type={}",
                    user.getId(),
                    ex.getClass().getSimpleName()
            );
        }
    }

    private String generateToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String buildResetLink(String rawToken) {
        String baseUrl = properties.getFrontendBaseUrl();
        String normalizedBaseUrl = (baseUrl == null || baseUrl.isBlank())
                ? "http://localhost:5173"
                : baseUrl.trim().replaceAll("/+$", "");
        String encodedToken = URLEncoder.encode(rawToken, StandardCharsets.UTF_8);
        return normalizedBaseUrl + "/reset-password?token=" + encodedToken;
    }

    private boolean isInvalid(PasswordResetToken resetToken, LocalDateTime now) {
        return resetToken.getUsedAt() != null
                || resetToken.getExpiresAt() == null
                || !resetToken.getExpiresAt().isAfter(now);
    }

    private ResponseStatusException invalidToken() {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password reset link is invalid or expired");
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
