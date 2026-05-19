package vn.edu.hcmuaf.fit.marketplace.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.server.ResponseStatusException;
import vn.edu.hcmuaf.fit.marketplace.dto.request.AdminProcessReportRequest;
import vn.edu.hcmuaf.fit.marketplace.entity.*;
import vn.edu.hcmuaf.fit.marketplace.repository.*;

import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ProductReportServiceTest {

    @Autowired
    private ProductReportService productReportService;

    @Autowired
    private ProductReportRepository productReportRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private ProductAuditLogRepository productAuditLogRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "SUPER_ADMIN" })
    void processReportBanUpdatesProductReportsAuditAndNotification() {
        User admin = new User();
        admin.setEmail("admin@example.com");
        admin.setPassword("password");
        admin.setName("Admin");
        admin.setRole(User.Role.SUPER_ADMIN);
        userRepository.save(admin);

        User vendor = new User();
        vendor.setEmail("vendor@example.com");
        vendor.setPassword("password");
        vendor.setName("Vendor");
        vendor.setRole(User.Role.VENDOR);
        userRepository.save(vendor);

        Store store = new Store();
        store.setName("Test Store");
        store.setOwner(vendor);
        storeRepository.save(store);

        Product product = new Product();
        product.setName("Test Product");
        product.setSku("TEST-01");
        product.setApprovalStatus(Product.ApprovalStatus.APPROVED);
        product.setStoreId(store.getId());
        productRepository.save(product);

        ProductReport report = new ProductReport();
        report.setProductId(product.getId());
        report.setUserId(admin.getId());
        report.setReason(ProductReport.ReportReason.FAKE_PRODUCT);
        report.setStatus(ProductReport.ReportStatus.PENDING);
        productReportRepository.save(report);

        AdminProcessReportRequest request = new AdminProcessReportRequest();
        request.setAction(AdminProcessReportRequest.ProcessAction.BAN);
        request.setAdminNote("test integration");

        productReportService.processReport(report.getId(), request, "admin@example.com");
        productAuditLogRepository.flush();
        productReportRepository.flush();
        productRepository.flush();
        notificationRepository.flush();

        Product updatedProduct = productRepository.findById(product.getId()).orElseThrow();
        ProductReport updatedReport = productReportRepository.findById(report.getId()).orElseThrow();
        assertThat(updatedProduct.getApprovalStatus()).isEqualTo(Product.ApprovalStatus.BANNED);
        assertThat(updatedReport.getStatus()).isEqualTo(ProductReport.ReportStatus.CONFIRMED);
        assertThat(updatedReport.getAdminNote()).isEqualTo("test integration");
        assertThat(productAuditLogRepository.findByProductIdOrderByCreatedAtDesc(product.getId()))
                .anySatisfy(audit -> {
                    assertThat(audit.getAdminId()).isEqualTo(admin.getId());
                    assertThat(audit.getAction()).isEqualTo(ProductAuditLog.Action.REPORT_CONFIRMED);
                    assertThat(audit.getReason()).isEqualTo("test integration");
                });
        assertThat(notificationRepository.findAll())
                .anySatisfy(notification -> {
                    assertThat(notification.getUser().getId()).isEqualTo(vendor.getId());
                    assertThat(notification.getTitle()).isNotBlank();
                    assertThat(notification.getMessage()).contains("Test Product");
                });
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = { "SUPER_ADMIN" })
    void processReportBanRequiresAdminReason() {
        User admin = new User();
        admin.setEmail("admin@example.com");
        admin.setPassword("password");
        admin.setName("Admin");
        admin.setRole(User.Role.SUPER_ADMIN);
        userRepository.save(admin);

        Product product = new Product();
        product.setName("No Reason Product");
        product.setSku("NO-REASON-01");
        product.setApprovalStatus(Product.ApprovalStatus.APPROVED);
        productRepository.save(product);

        ProductReport report = new ProductReport();
        report.setProductId(product.getId());
        report.setUserId(admin.getId());
        report.setReason(ProductReport.ReportReason.FAKE_PRODUCT);
        report.setStatus(ProductReport.ReportStatus.PENDING);
        productReportRepository.save(report);

        AdminProcessReportRequest request = new AdminProcessReportRequest();
        request.setAction(AdminProcessReportRequest.ProcessAction.BAN);
        request.setAdminNote(" ");

        assertThatThrownBy(() -> productReportService.processReport(report.getId(), request, "admin@example.com"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Ban reason is required");
    }
}
