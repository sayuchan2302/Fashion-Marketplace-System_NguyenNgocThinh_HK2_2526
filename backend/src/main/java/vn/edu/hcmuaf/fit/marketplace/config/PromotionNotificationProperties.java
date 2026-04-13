package vn.edu.hcmuaf.fit.marketplace.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.notifications.promotion")
public class PromotionNotificationProperties {

    private String timezone = "Asia/Ho_Chi_Minh";
    private Dispatcher dispatcher = new Dispatcher();
    private Reminder reminder = new Reminder();

    @Getter
    @Setter
    public static class Dispatcher {
        private long fixedDelayMs = 15000;
        private int batchSize = 100;
        private int maxAttempts = 8;
        private List<Long> backoffMinutes = new ArrayList<>(List.of(1L, 5L, 15L, 60L));
    }

    @Getter
    @Setter
    public static class Reminder {
        private String cron = "0 */10 * * * *";
    }
}
