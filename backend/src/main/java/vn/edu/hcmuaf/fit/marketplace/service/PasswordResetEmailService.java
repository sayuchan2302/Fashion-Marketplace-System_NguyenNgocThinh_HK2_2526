package vn.edu.hcmuaf.fit.marketplace.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import vn.edu.hcmuaf.fit.marketplace.config.PasswordResetProperties;
import vn.edu.hcmuaf.fit.marketplace.entity.User;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class PasswordResetEmailService {

    private static final DateTimeFormatter EXPIRES_AT_FORMATTER = DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy");

    private final JavaMailSender mailSender;
    private final PasswordResetProperties properties;

    public PasswordResetEmailService(JavaMailSender mailSender, PasswordResetProperties properties) {
        this.mailSender = mailSender;
        this.properties = properties;
    }

    public void sendPasswordResetEmail(User user, String resetLink, LocalDateTime expiresAt) {
        SimpleMailMessage message = new SimpleMailMessage();
        if (StringUtils.hasText(properties.getMailFrom())) {
            message.setFrom(properties.getMailFrom().trim());
        }
        message.setTo(user.getEmail());
        message.setSubject("Dat lai mat khau Fashion Marketplace");
        message.setText(buildBody(user, resetLink, expiresAt));
        mailSender.send(message);
    }

    private String buildBody(User user, String resetLink, LocalDateTime expiresAt) {
        String name = StringUtils.hasText(user.getName()) ? user.getName().trim() : "ban";
        return """
                Xin chao %s,

                Chung toi nhan duoc yeu cau dat lai mat khau cho tai khoan Fashion Marketplace cua ban.

                Vui long mo lien ket duoi day de dat mat khau moi:
                %s

                Lien ket nay het han luc %s va chi su dung duoc mot lan.
                Neu ban khong yeu cau dat lai mat khau, hay bo qua email nay.
                """.formatted(name, resetLink, expiresAt.format(EXPIRES_AT_FORMATTER));
    }
}
