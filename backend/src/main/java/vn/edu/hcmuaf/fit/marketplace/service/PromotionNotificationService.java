package vn.edu.hcmuaf.fit.marketplace.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.fit.marketplace.entity.PromotionNotificationDispatch;
import vn.edu.hcmuaf.fit.marketplace.entity.PromotionNotificationEvent;
import vn.edu.hcmuaf.fit.marketplace.entity.Store;
import vn.edu.hcmuaf.fit.marketplace.entity.User;
import vn.edu.hcmuaf.fit.marketplace.entity.Voucher;
import vn.edu.hcmuaf.fit.marketplace.repository.PromotionNotificationDispatchRepository;
import vn.edu.hcmuaf.fit.marketplace.repository.PromotionNotificationEventRepository;
import vn.edu.hcmuaf.fit.marketplace.repository.StoreFollowRepository;
import vn.edu.hcmuaf.fit.marketplace.repository.StoreRepository;
import vn.edu.hcmuaf.fit.marketplace.repository.UserRepository;
import vn.edu.hcmuaf.fit.marketplace.repository.VoucherRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Supplier;
import java.util.stream.Collectors;

@Slf4j
@Service
public class PromotionNotificationService {

    private static final String VOUCHER_WALLET_LINK = "/profile?tab=vouchers";
    private static final int ACTIVE_CUSTOMER_DAYS = 90;

    private final StoreRepository storeRepository;
    private final StoreFollowRepository storeFollowRepository;
    private final UserRepository userRepository;
    private final VoucherRepository voucherRepository;
    private final PromotionNotificationEventRepository eventRepository;
    private final PromotionNotificationDispatchRepository dispatchRepository;

    public PromotionNotificationService(
            StoreRepository storeRepository,
            StoreFollowRepository storeFollowRepository,
            UserRepository userRepository,
            VoucherRepository voucherRepository,
            PromotionNotificationEventRepository eventRepository,
            PromotionNotificationDispatchRepository dispatchRepository
    ) {
        this.storeRepository = storeRepository;
        this.storeFollowRepository = storeFollowRepository;
        this.userRepository = userRepository;
        this.voucherRepository = voucherRepository;
        this.eventRepository = eventRepository;
        this.dispatchRepository = dispatchRepository;
    }

    @Transactional
    public void notifyStoreFollowersForRunningVoucher(Voucher voucher) {
        if (voucher == null || voucher.getId() == null || voucher.getStoreId() == null) {
            return;
        }
        String safeVoucherCode = normalize(voucher.getCode(), "VOUCHER");
        Store store = storeRepository.findById(voucher.getStoreId()).orElse(null);
        String storeSlug = normalize(store == null ? null : store.getSlug(), "");
        String link = storeSlug.isBlank() ? VOUCHER_WALLET_LINK : "/store/" + storeSlug;
        String eventKey = buildStoreNewEventKey(voucher.getId());

        PromotionNotificationEvent event = getOrCreateEvent(
                eventKey,
                () -> PromotionNotificationEvent.builder()
                        .eventKey(eventKey)
                        .eventType(PromotionNotificationEvent.EventType.STORE_NEW)
                        .status(PromotionNotificationEvent.EventStatus.READY)
                        .voucherId(voucher.getId())
                        .voucherCode(safeVoucherCode)
                        .storeId(voucher.getStoreId())
                        .link(link)
                        .endDate(voucher.getEndDate())
                        .build()
        );
        if (event == null || dispatchRepository.countByEventId(event.getId()) > 0) {
            return;
        }

        List<UUID> followerIds = storeFollowRepository.findFollowerUserIdsByStoreIdAndRoleAndActive(
                voucher.getStoreId(),
                User.Role.CUSTOMER
        );
        createDispatches(event, followerIds);
    }

    @Transactional
    public void notifyMarketplaceCampaign(String voucherCode, LocalDate startDate, LocalDate endDate) {
        String safeVoucherCode = normalize(voucherCode, "VOUCHER").toUpperCase(Locale.ROOT);
        String eventKey = buildMarketplaceNewEventKey(safeVoucherCode, startDate, endDate);

        PromotionNotificationEvent event = getOrCreateEvent(
                eventKey,
                () -> PromotionNotificationEvent.builder()
                        .eventKey(eventKey)
                        .eventType(PromotionNotificationEvent.EventType.MARKETPLACE_NEW)
                        .status(PromotionNotificationEvent.EventStatus.READY)
                        .voucherCode(safeVoucherCode)
                        .storeId(null)
                        .link(VOUCHER_WALLET_LINK)
                        .endDate(endDate)
                        .build()
        );
        if (event == null || dispatchRepository.countByEventId(event.getId()) > 0) {
            return;
        }

        LocalDateTime cutoff = LocalDateTime.now().minusDays(ACTIVE_CUSTOMER_DAYS);
        List<UUID> recipients = userRepository.findActiveCustomerIdsForPromotion(User.Role.CUSTOMER, cutoff);
        createDispatches(event, recipients);
    }

    @Transactional
    public void notifyMarketplaceCampaign(String voucherCode) {
        notifyMarketplaceCampaign(voucherCode, null, null);
    }

    @Transactional
    public int createDueReminderEvents(LocalDateTime now, ZoneId zoneId) {
        LocalDate today = now.toLocalDate();
        List<PromotionNotificationEvent> roots = eventRepository.findReminderRootCandidates(
                List.of(
                        PromotionNotificationEvent.EventType.STORE_NEW,
                        PromotionNotificationEvent.EventType.MARKETPLACE_NEW
                ),
                today,
                today.plusDays(1),
                PromotionNotificationEvent.EventStatus.CANCELLED
        );
        int created = 0;
        for (PromotionNotificationEvent root : roots) {
            if (createReminderFromRoot(root, PromotionNotificationEvent.EventType.REMINDER_24H, now, zoneId)) {
                created++;
            }
            if (createReminderFromRoot(root, PromotionNotificationEvent.EventType.REMINDER_3H, now, zoneId)) {
                created++;
            }
        }
        return created;
    }

    public String buildStoreNewEventKey(UUID voucherId) {
        return "STORE_NEW:" + voucherId;
    }

    public String buildMarketplaceNewEventKey(String voucherCode, LocalDate startDate, LocalDate endDate) {
        return "MARKETPLACE_NEW:" + normalize(voucherCode, "VOUCHER").toUpperCase(Locale.ROOT)
                + ":" + (startDate == null ? "NA" : startDate)
                + ":" + (endDate == null ? "NA" : endDate);
    }

    public String buildReminderEventKey(PromotionNotificationEvent.EventType reminderType, UUID rootEventId) {
        return reminderType.name() + ":" + rootEventId;
    }

    private boolean createReminderFromRoot(
            PromotionNotificationEvent root,
            PromotionNotificationEvent.EventType reminderType,
            LocalDateTime now,
            ZoneId zoneId
    ) {
        if (root == null || root.getId() == null || root.getEndDate() == null) {
            return false;
        }
        if (!isReminderWindowReached(root.getEndDate(), reminderType, now, zoneId)) {
            return false;
        }
        if (!isEventStillPubliclyAvailable(root, now.toLocalDate())) {
            return false;
        }

        String reminderKey = buildReminderEventKey(reminderType, root.getId());
        if (eventRepository.existsByEventKey(reminderKey)) {
            return false;
        }

        List<UUID> recipientIds = dispatchRepository.findDistinctUserIdsByEventId(root.getId());
        if (recipientIds == null || recipientIds.isEmpty()) {
            return false;
        }

        PromotionNotificationEvent reminderEvent = getOrCreateEvent(
                reminderKey,
                () -> PromotionNotificationEvent.builder()
                        .eventKey(reminderKey)
                        .eventType(reminderType)
                        .status(PromotionNotificationEvent.EventStatus.READY)
                        .rootEventId(root.getId())
                        .voucherId(root.getVoucherId())
                        .voucherCode(root.getVoucherCode())
                        .storeId(root.getStoreId())
                        .link(root.getLink())
                        .endDate(root.getEndDate())
                        .build()
        );
        if (reminderEvent == null || dispatchRepository.countByEventId(reminderEvent.getId()) > 0) {
            return false;
        }

        createDispatches(reminderEvent, recipientIds);
        return true;
    }

    private PromotionNotificationEvent getOrCreateEvent(
            String eventKey,
            Supplier<PromotionNotificationEvent> eventFactory
    ) {
        PromotionNotificationEvent existing = eventRepository.findByEventKey(eventKey).orElse(null);
        if (existing != null) {
            return existing;
        }
        try {
            return eventRepository.save(eventFactory.get());
        } catch (DataIntegrityViolationException ex) {
            log.debug("Promotion event already existed for key={}", eventKey);
            return eventRepository.findByEventKey(eventKey).orElse(null);
        }
    }

    private void createDispatches(PromotionNotificationEvent event, Collection<UUID> recipientIds) {
        if (event == null || event.getId() == null) {
            return;
        }

        Set<UUID> uniqueIds = normalizeRecipientIds(recipientIds);
        if (uniqueIds.isEmpty()) {
            event.setStatus(PromotionNotificationEvent.EventStatus.COMPLETED);
            eventRepository.save(event);
            return;
        }

        Map<UUID, User> userMap = userRepository.findAllById(uniqueIds).stream()
                .collect(Collectors.toMap(User::getId, user -> user));

        List<PromotionNotificationDispatch> dispatches = uniqueIds.stream()
                .map(userMap::get)
                .filter(user -> user != null)
                .<PromotionNotificationDispatch>map(user -> PromotionNotificationDispatch.builder()
                        .event(event)
                        .user(user)
                        .dispatchStatus(PromotionNotificationDispatch.DispatchStatus.PENDING)
                        .attemptCount(0)
                        .nextRetryAt(null)
                        .lastError(null)
                        .notificationId(null)
                        .build())
                .collect(Collectors.toList());

        if (dispatches.isEmpty()) {
            event.setStatus(PromotionNotificationEvent.EventStatus.COMPLETED);
            eventRepository.save(event);
            return;
        }
        dispatchRepository.saveAll(dispatches);
    }

    private Set<UUID> normalizeRecipientIds(Collection<UUID> recipientIds) {
        if (recipientIds == null || recipientIds.isEmpty()) {
            return Set.of();
        }
        return recipientIds.stream()
                .filter(id -> id != null)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private boolean isReminderWindowReached(
            LocalDate endDate,
            PromotionNotificationEvent.EventType reminderType,
            LocalDateTime now,
            ZoneId zoneId
    ) {
        if (endDate == null || now == null || zoneId == null) {
            return false;
        }
        int hours = reminderType == PromotionNotificationEvent.EventType.REMINDER_3H ? 3 : 24;
        ZonedDateTime nowZ = now.atZone(zoneId);
        ZonedDateTime expiry = endDate.atTime(23, 59, 59).atZone(zoneId);
        ZonedDateTime triggerAt = expiry.minusHours(hours);
        return !nowZ.isBefore(triggerAt) && nowZ.isBefore(expiry);
    }

    private boolean isEventStillPubliclyAvailable(PromotionNotificationEvent event, LocalDate today) {
        if (event == null || today == null) {
            return false;
        }
        if (event.getVoucherId() != null) {
            return voucherRepository.findById(event.getVoucherId())
                    .map(voucher -> isVoucherPubliclyAvailable(voucher, today))
                    .orElse(false);
        }
        String code = normalize(event.getVoucherCode(), "");
        if (code.isBlank()) {
            return false;
        }
        return voucherRepository.existsPublicAvailableByCode(code, Voucher.VoucherStatus.RUNNING, today);
    }

    private boolean isVoucherPubliclyAvailable(Voucher voucher, LocalDate today) {
        if (voucher == null || voucher.getStatus() != Voucher.VoucherStatus.RUNNING) {
            return false;
        }
        if (voucher.getStartDate() != null && voucher.getStartDate().isAfter(today)) {
            return false;
        }
        if (voucher.getEndDate() != null && voucher.getEndDate().isBefore(today)) {
            return false;
        }
        int usedCount = voucher.getUsedCount() == null ? 0 : voucher.getUsedCount();
        int totalIssued = voucher.getTotalIssued() == null ? 0 : Math.max(voucher.getTotalIssued(), 0);
        return usedCount < totalIssued;
    }

    private String normalize(String raw, String fallback) {
        if (raw == null) {
            return fallback;
        }
        String normalized = raw.trim();
        return normalized.isEmpty() ? fallback : normalized;
    }
}
