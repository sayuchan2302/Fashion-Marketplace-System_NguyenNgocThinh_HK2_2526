package vn.edu.hcmuaf.fit.marketplace.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import vn.edu.hcmuaf.fit.marketplace.config.PromotionNotificationProperties;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Slf4j
@Service
public class PromotionReminderScheduler {

    private final PromotionNotificationService promotionNotificationService;
    private final PromotionNotificationProperties properties;

    public PromotionReminderScheduler(
            PromotionNotificationService promotionNotificationService,
            PromotionNotificationProperties properties
    ) {
        this.promotionNotificationService = promotionNotificationService;
        this.properties = properties;
    }

    @Scheduled(
            cron = "${app.notifications.promotion.reminder.cron:0 */10 * * * *}",
            zone = "${app.notifications.promotion.timezone:Asia/Ho_Chi_Minh}"
    )
    public void createReminderEvents() {
        ZoneId zoneId = resolveZone();
        int created = promotionNotificationService.createDueReminderEvents(LocalDateTime.now(zoneId), zoneId);
        if (created > 0) {
            log.debug("Promotion reminder scheduler created {} events", created);
        }
    }

    private ZoneId resolveZone() {
        try {
            String timezone = properties.getTimezone();
            return ZoneId.of(timezone == null || timezone.isBlank() ? "Asia/Ho_Chi_Minh" : timezone);
        } catch (Exception ex) {
            return ZoneId.of("Asia/Ho_Chi_Minh");
        }
    }
}
