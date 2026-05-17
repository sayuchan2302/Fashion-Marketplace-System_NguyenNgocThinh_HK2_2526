package vn.edu.hcmuaf.fit.marketplace.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.facebook")
public class FacebookAuthProperties {
    private String appId = "";
    private String appSecret = "";
    private String graphApiUrl = "https://graph.facebook.com/v18.0";
    private String fields = "id,name,email,picture";
}