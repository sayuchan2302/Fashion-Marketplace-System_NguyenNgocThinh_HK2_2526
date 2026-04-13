package vn.edu.hcmuaf.fit.marketplace.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PromotionNotificationServiceTest {

    @Mock
    private StoreRepository storeRepository;

    @Mock
    private StoreFollowRepository storeFollowRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private VoucherRepository voucherRepository;

    @Mock
    private PromotionNotificationEventRepository eventRepository;

    @Mock
    private PromotionNotificationDispatchRepository dispatchRepository;

    private PromotionNotificationService promotionNotificationService;

    @BeforeEach
    void setUp() {
        promotionNotificationService = new PromotionNotificationService(
                storeRepository,
                storeFollowRepository,
                userRepository,
                voucherRepository,
                eventRepository,
                dispatchRepository
        );
    }

    @Test
    void enqueueStoreVoucherIsIdempotentForSameEventKey() {
        UUID storeId = UUID.randomUUID();
        UUID voucherId = UUID.randomUUID();
        UUID customerA = UUID.randomUUID();
        UUID customerB = UUID.randomUUID();
        String eventKey = "STORE_NEW:" + voucherId;

        Voucher voucher = Voucher.builder()
                .id(voucherId)
                .storeId(storeId)
                .code("FLASH30")
                .name("Flash 30")
                .discountType(Voucher.DiscountType.PERCENT)
                .discountValue(new BigDecimal("30"))
                .minOrderValue(BigDecimal.ZERO)
                .totalIssued(100)
                .usedCount(0)
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(7))
                .status(Voucher.VoucherStatus.RUNNING)
                .build();
        Store store = Store.builder().id(storeId).name("Streetwear").slug("streetwear").build();

        PromotionNotificationEvent savedEvent = PromotionNotificationEvent.builder()
                .id(UUID.randomUUID())
                .eventKey(eventKey)
                .eventType(PromotionNotificationEvent.EventType.STORE_NEW)
                .status(PromotionNotificationEvent.EventStatus.READY)
                .voucherId(voucherId)
                .voucherCode("FLASH30")
                .storeId(storeId)
                .link("/store/streetwear")
                .endDate(voucher.getEndDate())
                .build();

        when(storeRepository.findById(storeId)).thenReturn(Optional.of(store));
        when(eventRepository.findByEventKey(eventKey))
                .thenReturn(Optional.empty())
                .thenReturn(Optional.of(savedEvent));
        when(eventRepository.save(any(PromotionNotificationEvent.class))).thenReturn(savedEvent);
        when(dispatchRepository.countByEventId(savedEvent.getId())).thenReturn(0L, 2L);
        when(storeFollowRepository.findFollowerUserIdsByStoreIdAndRoleAndActive(storeId, User.Role.CUSTOMER))
                .thenReturn(List.of(customerA, customerB, customerA));
        when(userRepository.findAllById(any())).thenReturn(List.of(
                User.builder().id(customerA).build(),
                User.builder().id(customerB).build()
        ));

        promotionNotificationService.notifyStoreFollowersForRunningVoucher(voucher);
        promotionNotificationService.notifyStoreFollowersForRunningVoucher(voucher);

        verify(eventRepository, times(1)).save(any(PromotionNotificationEvent.class));
        verify(dispatchRepository, times(1)).saveAll(any());
    }

    @Test
    void marketplaceCampaignCreatesDispatchRowsForDistinctRecipients() {
        UUID customerA = UUID.randomUUID();
        UUID customerB = UUID.randomUUID();
        LocalDate startDate = LocalDate.now().minusDays(1);
        LocalDate endDate = LocalDate.now().plusDays(3);
        String code = "MEGA99";
        String eventKey = "MARKETPLACE_NEW:MEGA99:" + startDate + ":" + endDate;

        PromotionNotificationEvent savedEvent = PromotionNotificationEvent.builder()
                .id(UUID.randomUUID())
                .eventKey(eventKey)
                .eventType(PromotionNotificationEvent.EventType.MARKETPLACE_NEW)
                .status(PromotionNotificationEvent.EventStatus.READY)
                .voucherCode(code)
                .link("/profile?tab=vouchers")
                .endDate(endDate)
                .build();

        when(eventRepository.findByEventKey(eventKey)).thenReturn(Optional.empty());
        when(eventRepository.save(any(PromotionNotificationEvent.class))).thenReturn(savedEvent);
        when(dispatchRepository.countByEventId(savedEvent.getId())).thenReturn(0L);
        when(userRepository.findActiveCustomerIdsForPromotion(eq(User.Role.CUSTOMER), any(LocalDateTime.class)))
                .thenReturn(List.of(customerA, customerB, customerA));
        when(userRepository.findAllById(any())).thenReturn(List.of(
                User.builder().id(customerA).build(),
                User.builder().id(customerB).build()
        ));

        promotionNotificationService.notifyMarketplaceCampaign(code, startDate, endDate);

        verify(dispatchRepository, times(1)).saveAll(any());
        verify(eventRepository, never()).existsByEventKey(any());
    }

    @Test
    void reminderCreationCreatesBoth24hAnd3hEventsWhenWindowReached() {
        UUID rootEventId = UUID.randomUUID();
        UUID voucherId = UUID.randomUUID();
        UUID userA = UUID.randomUUID();
        UUID userB = UUID.randomUUID();
        LocalDate today = LocalDate.of(2026, 4, 13);
        LocalDateTime now = LocalDateTime.of(2026, 4, 13, 22, 0, 0);
        ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");

        PromotionNotificationEvent rootEvent = PromotionNotificationEvent.builder()
                .id(rootEventId)
                .eventKey("STORE_NEW:" + voucherId)
                .eventType(PromotionNotificationEvent.EventType.STORE_NEW)
                .status(PromotionNotificationEvent.EventStatus.COMPLETED)
                .voucherId(voucherId)
                .voucherCode("FLASH30")
                .storeId(UUID.randomUUID())
                .link("/profile?tab=vouchers")
                .endDate(today)
                .build();

        when(eventRepository.findReminderRootCandidates(any(), eq(today), eq(today.plusDays(1)), eq(PromotionNotificationEvent.EventStatus.CANCELLED)))
                .thenReturn(List.of(rootEvent));
        when(voucherRepository.findById(voucherId)).thenReturn(Optional.of(
                Voucher.builder()
                        .id(voucherId)
                        .status(Voucher.VoucherStatus.RUNNING)
                        .totalIssued(100)
                        .usedCount(10)
                        .startDate(today.minusDays(2))
                        .endDate(today)
                        .build()
        ));
        when(dispatchRepository.findDistinctUserIdsByEventId(rootEventId)).thenReturn(List.of(userA, userB));
        when(eventRepository.existsByEventKey("REMINDER_24H:" + rootEventId)).thenReturn(false);
        when(eventRepository.existsByEventKey("REMINDER_3H:" + rootEventId)).thenReturn(false);

        PromotionNotificationEvent reminder24h = PromotionNotificationEvent.builder()
                .id(UUID.randomUUID())
                .eventKey("REMINDER_24H:" + rootEventId)
                .eventType(PromotionNotificationEvent.EventType.REMINDER_24H)
                .status(PromotionNotificationEvent.EventStatus.READY)
                .voucherId(voucherId)
                .voucherCode("FLASH30")
                .link("/profile?tab=vouchers")
                .endDate(today)
                .build();
        PromotionNotificationEvent reminder3h = PromotionNotificationEvent.builder()
                .id(UUID.randomUUID())
                .eventKey("REMINDER_3H:" + rootEventId)
                .eventType(PromotionNotificationEvent.EventType.REMINDER_3H)
                .status(PromotionNotificationEvent.EventStatus.READY)
                .voucherId(voucherId)
                .voucherCode("FLASH30")
                .link("/profile?tab=vouchers")
                .endDate(today)
                .build();
        when(eventRepository.save(any(PromotionNotificationEvent.class)))
                .thenReturn(reminder24h)
                .thenReturn(reminder3h);
        when(dispatchRepository.countByEventId(reminder24h.getId())).thenReturn(0L);
        when(dispatchRepository.countByEventId(reminder3h.getId())).thenReturn(0L);
        when(userRepository.findAllById(any())).thenReturn(List.of(
                User.builder().id(userA).build(),
                User.builder().id(userB).build()
        ));

        int created = promotionNotificationService.createDueReminderEvents(now, zoneId);

        assertEquals(2, created);
        verify(dispatchRepository, times(2)).saveAll(any());
        assertTrue(created > 0);
    }

    @Test
    void reminderCreationSkipsWhenVoucherNoLongerAvailable() {
        UUID rootEventId = UUID.randomUUID();
        UUID voucherId = UUID.randomUUID();
        LocalDate today = LocalDate.of(2026, 4, 13);
        LocalDateTime now = LocalDateTime.of(2026, 4, 13, 22, 0, 0);
        ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");

        PromotionNotificationEvent rootEvent = PromotionNotificationEvent.builder()
                .id(rootEventId)
                .eventType(PromotionNotificationEvent.EventType.STORE_NEW)
                .status(PromotionNotificationEvent.EventStatus.COMPLETED)
                .voucherId(voucherId)
                .voucherCode("FLASH30")
                .link("/profile?tab=vouchers")
                .endDate(today)
                .build();

        when(eventRepository.findReminderRootCandidates(any(), eq(today), eq(today.plusDays(1)), eq(PromotionNotificationEvent.EventStatus.CANCELLED)))
                .thenReturn(List.of(rootEvent));
        when(voucherRepository.findById(voucherId)).thenReturn(Optional.of(
                Voucher.builder()
                        .id(voucherId)
                        .status(Voucher.VoucherStatus.PAUSED)
                        .totalIssued(100)
                        .usedCount(0)
                        .startDate(today.minusDays(2))
                        .endDate(today)
                        .build()
        ));

        int created = promotionNotificationService.createDueReminderEvents(now, zoneId);

        assertEquals(0, created);
        verify(dispatchRepository, never()).saveAll(any());
    }
}
