package vn.edu.hcmuaf.fit.marketplace.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.password-reset")
public class PasswordResetProperties {
    private String frontendBaseUrl = "http://localhost:5173";
    private String mailFrom = "";
    private int tokenTtlMinutes = 30;
    private int maxRequestsPerHour = 5;
}
