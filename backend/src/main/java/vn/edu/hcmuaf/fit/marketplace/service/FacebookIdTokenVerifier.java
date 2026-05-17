package vn.edu.hcmuaf.fit.marketplace.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import vn.edu.hcmuaf.fit.marketplace.config.FacebookAuthProperties;

import java.util.Map;

@Service
public class FacebookIdTokenVerifier {
    private static final Logger logger = LoggerFactory.getLogger(FacebookIdTokenVerifier.class);

    private final FacebookAuthProperties properties;
    private final RestTemplate restTemplate;

    public FacebookIdTokenVerifier(FacebookAuthProperties properties) {
        this.properties = properties;
        this.restTemplate = new RestTemplate();
    }

    public FacebookUserInfo verify(String accessToken) {
        if (accessToken == null || accessToken.isBlank()) {
            throw new IllegalArgumentException("Access token is required");
        }

        String url = String.format("%s/me?fields=%s&access_token=%s",
                properties.getGraphApiUrl(),
                properties.getFields(),
                accessToken);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response == null) {
                throw new IllegalArgumentException("Invalid response from Facebook");
            }

            if (response.containsKey("error")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> error = (Map<String, Object>) response.get("error");
                String errorMessage = (String) error.getOrDefault("message", "Unknown error");
                throw new IllegalArgumentException("Facebook API error: " + errorMessage);
            }

            String id = (String) response.get("id");
            String email = (String) response.get("email");
            String name = (String) response.get("name");
            String picture = null;

            if (response.containsKey("picture") && response.get("picture") instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> pictureData = (Map<String, Object>) response.get("picture");
                if (pictureData.containsKey("data") && pictureData.get("data") instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> pictureUrlData = (Map<String, Object>) pictureData.get("data");
                    picture = (String) pictureUrlData.get("url");
                }
            }

            if (id == null) {
                throw new IllegalArgumentException("Facebook user ID not found");
            }

            logger.debug("Facebook user verified: id={}, email={}", id, email);
            return new FacebookUserInfo(id, email, name, picture);

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            logger.warn("Facebook token verification failed: {}", e.getMessage());
            throw new IllegalArgumentException("Failed to verify Facebook token");
        }
    }
}