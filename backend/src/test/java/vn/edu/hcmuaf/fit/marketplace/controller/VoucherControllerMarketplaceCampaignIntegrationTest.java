package vn.edu.hcmuaf.fit.marketplace.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import vn.edu.hcmuaf.fit.marketplace.entity.Store;
import vn.edu.hcmuaf.fit.marketplace.entity.Voucher;
import vn.edu.hcmuaf.fit.marketplace.repository.PromotionNotificationDispatchRepository;
import vn.edu.hcmuaf.fit.marketplace.repository.PromotionNotificationEventRepository;
import vn.edu.hcmuaf.fit.marketplace.repository.StoreRepository;
import vn.edu.hcmuaf.fit.marketplace.repository.UserRepository;
import vn.edu.hcmuaf.fit.marketplace.repository.VoucherRepository;
import vn.edu.hcmuaf.fit.marketplace.service.PromotionNotificationDispatcherService;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class VoucherControllerMarketplaceCampaignIntegrationTest {

    private static final String TEST_PASSWORD = "Test@123";
    private static final String ADMIN_EMAIL = "admin@fashion.local";
    private static final String VENDOR_EMAIL = "an.shop@fashion.local";
    private static final String CUSTOMER_EMAIL = "minh.customer@fashion.local";

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private VoucherRepository voucherRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PromotionNotificationEventRepository promotionNotificationEventRepository;

    @Autowired
    private PromotionNotificationDispatchRepository promotionNotificationDispatchRepository;

    @Autowired
    private PromotionNotificationDispatcherService promotionNotificationDispatcherService;

    @Test
    void adminCanCreateMarketplaceCampaignAndCustomerGetsPromotionNotification() throws Exception {
        String adminToken = loginAndExtractToken(ADMIN_EMAIL, TEST_PASSWORD);
        String customerToken = loginAndExtractToken(CUSTOMER_EMAIL, TEST_PASSWORD);

        List<Store> approvedActiveStores = storeRepository.findByApprovalStatusAndStatus(
                Store.ApprovalStatus.APPROVED,
                Store.StoreStatus.ACTIVE
        );
        assertFalse(approvedActiveStores.isEmpty(), "Expected at least one approved active store from seed data");

        String uniqueCode = "MKT" + System.currentTimeMillis();
        Map<String, Object> payload = Map.of(
                "name", "Marketplace Campaign Integration",
                "code", uniqueCode,
                "description", "Integration test for marketplace campaign endpoint",
                "discountType", "PERCENT",
                "discountValue", 10,
                "minOrderValue", 100000,
                "totalIssued", 300,
                "startDate", LocalDate.now().minusDays(1).toString(),
                "endDate", LocalDate.now().plusDays(7).toString(),
                "status", "RUNNING"
        );

        ResponseEntity<String> createResponse = restTemplate.exchange(
                "/api/vouchers/admin/marketplace-campaign",
                HttpMethod.POST,
                authorizedJsonEntity(adminToken, payload),
                String.class
        );
        assertEquals(HttpStatus.CREATED, createResponse.getStatusCode());

        JsonNode responseBody = objectMapper.readTree(createResponse.getBody());
        assertEquals(uniqueCode, responseBody.path("code").asText());
        int createdCount = responseBody.path("createdCount").asInt();
        int failedCount = responseBody.path("failedCount").asInt();
        assertEquals(approvedActiveStores.size(), createdCount + failedCount);
        assertTrue(createdCount > 0, "Expected at least one voucher to be created");

        List<UUID> approvedStoreIds = approvedActiveStores.stream().map(Store::getId).toList();
        List<Voucher> createdVouchers = voucherRepository.findByCodeAndStoreIds(uniqueCode, approvedStoreIds);
        assertEquals(createdCount, createdVouchers.size(), "Created vouchers should match endpoint summary");

        String marketplaceEventKey = "MARKETPLACE_NEW:" + uniqueCode + ":" + payload.get("startDate") + ":" + payload.get("endDate");
        var marketplaceEvent = promotionNotificationEventRepository.findByEventKey(marketplaceEventKey).orElse(null);
        assertNotNull(marketplaceEvent, "Expected marketplace promotion event row to be created");
        assertTrue(
                promotionNotificationDispatchRepository.countByEventId(marketplaceEvent.getId()) > 0,
                "Expected per-recipient dispatch rows for marketplace event"
        );

        int firstBatch = promotionNotificationDispatcherService.dispatchDueAt(LocalDateTime.now());
        assertTrue(firstBatch > 0, "Expected dispatcher to process queued promotion dispatches");

        ResponseEntity<String> notificationsResponse = restTemplate.exchange(
                "/api/notifications/me?type=promotion&page=0&size=50",
                HttpMethod.GET,
                authorizedEntity(customerToken),
                String.class
        );
        assertEquals(HttpStatus.OK, notificationsResponse.getStatusCode());

        JsonNode notificationsBody = objectMapper.readTree(notificationsResponse.getBody());
        JsonNode content = notificationsBody.path("content");
        assertTrue(content.isArray());

        boolean foundMarketplacePromotion = false;
        for (JsonNode item : content) {
            if ("promotion".equalsIgnoreCase(item.path("type").asText())
                    && "/profile?tab=vouchers".equals(item.path("link").asText())
                    && item.path("title").asText().contains(uniqueCode)) {
                foundMarketplacePromotion = true;
                break;
            }
        }
        assertTrue(foundMarketplacePromotion, "Expected promotion notification for marketplace campaign");
    }

    @Test
    void vendorCannotCreateMarketplaceCampaign() {
        String vendorToken = loginAndExtractToken(VENDOR_EMAIL, TEST_PASSWORD);
        Map<String, Object> payload = Map.of(
                "name", "Should be blocked",
                "code", "BLOCK" + System.currentTimeMillis(),
                "discountType", "PERCENT",
                "discountValue", 10,
                "minOrderValue", 100000,
                "totalIssued", 100,
                "startDate", LocalDate.now().toString(),
                "endDate", LocalDate.now().plusDays(5).toString(),
                "status", "RUNNING"
        );

        ResponseEntity<String> response = restTemplate.exchange(
                "/api/vouchers/admin/marketplace-campaign",
                HttpMethod.POST,
                authorizedJsonEntity(vendorToken, payload),
                String.class
        );
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    @Test
    void vendorRunningVoucherNotifiesFollowersThroughDispatchPipeline() throws Exception {
        String vendorToken = loginAndExtractToken(VENDOR_EMAIL, TEST_PASSWORD);
        String customerToken = loginAndExtractToken(CUSTOMER_EMAIL, TEST_PASSWORD);

        UUID vendorStoreId = userRepository.findByEmail(VENDOR_EMAIL)
                .orElseThrow()
                .getStoreId();
        assertNotNull(vendorStoreId, "Expected vendor store id from seed data");

        ResponseEntity<String> followResponse = restTemplate.exchange(
                "/api/stores/" + vendorStoreId + "/follow",
                HttpMethod.POST,
                authorizedEntity(customerToken),
                String.class
        );
        assertEquals(HttpStatus.OK, followResponse.getStatusCode());

        String uniqueCode = "FOL" + System.currentTimeMillis();
        Map<String, Object> payload = Map.of(
                "name", "Follower Promo Integration",
                "code", uniqueCode,
                "description", "Follower should receive promotion notification",
                "discountType", "PERCENT",
                "discountValue", 12,
                "minOrderValue", 100000,
                "totalIssued", 100,
                "startDate", LocalDate.now().minusDays(1).toString(),
                "endDate", LocalDate.now().plusDays(4).toString(),
                "status", "RUNNING"
        );

        ResponseEntity<String> createResponse = restTemplate.exchange(
                "/api/vouchers/my-store",
                HttpMethod.POST,
                authorizedJsonEntity(vendorToken, payload),
                String.class
        );
        assertEquals(HttpStatus.CREATED, createResponse.getStatusCode());
        JsonNode created = objectMapper.readTree(createResponse.getBody());
        String voucherId = created.path("id").asText();
        assertFalse(voucherId.isBlank());

        String storeEventKey = "STORE_NEW:" + voucherId;
        var storeEvent = promotionNotificationEventRepository.findByEventKey(storeEventKey).orElse(null);
        assertNotNull(storeEvent, "Expected store promotion event row to be created");
        assertTrue(
                promotionNotificationDispatchRepository.countByEventId(storeEvent.getId()) > 0,
                "Expected dispatch rows for followers"
        );

        int processed = promotionNotificationDispatcherService.dispatchDueAt(LocalDateTime.now());
        assertTrue(processed > 0, "Expected dispatcher to process follower promotion dispatches");

        ResponseEntity<String> notificationsResponse = restTemplate.exchange(
                "/api/notifications/me?type=promotion&page=0&size=50",
                HttpMethod.GET,
                authorizedEntity(customerToken),
                String.class
        );
        assertEquals(HttpStatus.OK, notificationsResponse.getStatusCode());
        JsonNode notificationsBody = objectMapper.readTree(notificationsResponse.getBody());
        JsonNode content = notificationsBody.path("content");
        assertTrue(content.isArray());

        boolean foundFollowerPromotion = false;
        for (JsonNode item : content) {
            if ("promotion".equalsIgnoreCase(item.path("type").asText())
                    && item.path("title").asText().contains(uniqueCode)) {
                foundFollowerPromotion = true;
                break;
            }
        }
        assertTrue(foundFollowerPromotion, "Expected promotion notification from followed shop voucher");
    }

    @SuppressWarnings("unchecked")
    private String loginAndExtractToken(String email, String password) {
        Map<String, String> payload = Map.of(
                "email", email,
                "password", password
        );
        ResponseEntity<Map> loginResponse = restTemplate.postForEntity("/api/auth/login", payload, Map.class);
        assertEquals(HttpStatus.OK, loginResponse.getStatusCode());
        Map<String, Object> body = loginResponse.getBody();
        assertNotNull(body);
        Object token = body.get("token");
        assertNotNull(token);
        return String.valueOf(token);
    }

    private HttpEntity<Void> authorizedEntity(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        return new HttpEntity<>(headers);
    }

    private HttpEntity<Map<String, Object>> authorizedJsonEntity(String token, Map<String, Object> body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return new HttpEntity<>(body, headers);
    }
}
