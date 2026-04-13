package vn.edu.hcmuaf.fit.marketplace.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "promotion_notification_events",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_promo_notification_event_key", columnNames = {"event_key"})
        }
)
public class PromotionNotificationEvent extends BaseEntity {

    @Column(name = "event_key", nullable = false, length = 255)
    private String eventKey;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 40)
    private EventType eventType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EventStatus status;

    @Column(name = "root_event_id")
    private UUID rootEventId;

    @Column(name = "voucher_id")
    private UUID voucherId;

    @Column(name = "voucher_code", nullable = false, length = 100)
    private String voucherCode;

    @Column(name = "store_id")
    private UUID storeId;

    private String link;

    @Column(name = "end_date")
    private LocalDate endDate;

    public enum EventType {
        STORE_NEW,
        MARKETPLACE_NEW,
        REMINDER_24H,
        REMINDER_3H
    }

    public enum EventStatus {
        READY,
        COMPLETED,
        CANCELLED
    }
}
