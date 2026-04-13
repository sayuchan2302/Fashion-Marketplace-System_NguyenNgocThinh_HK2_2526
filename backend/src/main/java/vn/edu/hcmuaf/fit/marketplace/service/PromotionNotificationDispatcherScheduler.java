package vn.edu.hcmuaf.fit.marketplace.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class PromotionNotificationDispatcherScheduler {

    private final PromotionNotificationDispatcherService dispatcherService;

    public PromotionNotificationDispatcherScheduler(PromotionNotificationDispatcherService dispatcherService) {
        this.dispatcherService = dispatcherService;
    }

    @Scheduled(fixedDelayString = "${app.notifications.promotion.dispatcher.fixed-delay-ms:15000}")
    public void dispatchPromotionNotifications() {
        int processed = dispatcherService.dispatchDueNow();
        if (processed > 0) {
            log.debug("Promotion dispatcher processed {} rows", processed);
        }
    }
}
