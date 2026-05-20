package vn.edu.hcmuaf.fit.marketplace.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class VendorOrderSlaScheduler {
    private static final Logger log = LoggerFactory.getLogger(VendorOrderSlaScheduler.class);

    private final OrderService orderService;

    @Value("${app.orders.sla.vendor-confirmation.batch-size:100}")
    private int batchSize;

    public VendorOrderSlaScheduler(OrderService orderService) {
        this.orderService = orderService;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void autoCancelExpiredVendorConfirmationsOnStartup() {
        runAutoCancel("startup");
    }

    @Scheduled(cron = "${app.orders.sla.vendor-confirmation.cron:0 */15 * * * *}")
    public void autoCancelExpiredVendorConfirmations() {
        runAutoCancel("scheduled");
    }

    private void runAutoCancel(String source) {
        int cancelled = orderService.autoCancelExpiredVendorConfirmations(LocalDateTime.now(), batchSize);
        if (cancelled > 0) {
            log.info("Vendor confirmation SLA auto-cancelled {} order(s) via {}", cancelled, source);
        }
    }
}
