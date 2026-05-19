package vn.edu.hcmuaf.fit.marketplace.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.fit.marketplace.dto.response.VendorProductPageResponse;
import vn.edu.hcmuaf.fit.marketplace.dto.response.VendorProductSummaryResponse;
import vn.edu.hcmuaf.fit.marketplace.entity.Product;
import vn.edu.hcmuaf.fit.marketplace.entity.ProductAuditLog;
import vn.edu.hcmuaf.fit.marketplace.entity.Store;
import vn.edu.hcmuaf.fit.marketplace.entity.User;
import vn.edu.hcmuaf.fit.marketplace.repository.ProductAuditLogRepository;
import vn.edu.hcmuaf.fit.marketplace.repository.ProductRepository;
import vn.edu.hcmuaf.fit.marketplace.repository.StoreRepository;
import vn.edu.hcmuaf.fit.marketplace.repository.UserRepository;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ProductServiceVendorGovernanceIntegrationTest {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductAuditLogRepository productAuditLogRepository;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void vendorActivePageExcludesBannedProductsAndAllPageMarksThemBlocked() {
        String suffix = UUID.randomUUID().toString();
        User vendor = User.builder()
                .email("vendor-" + suffix + "@test.local")
                .password("password")
                .name("Vendor")
                .role(User.Role.VENDOR)
                .isActive(true)
                .build();
        userRepository.save(vendor);

        Store store = Store.builder()
                .name("Governance Store " + suffix)
                .slug("governance-store-" + suffix)
                .owner(vendor)
                .status(Store.StoreStatus.ACTIVE)
                .approvalStatus(Store.ApprovalStatus.APPROVED)
                .build();
        storeRepository.save(store);

        Product approved = Product.builder()
                .name("Approved Product " + suffix)
                .slug("approved-product-" + suffix)
                .sku("APP-" + suffix)
                .storeId(store.getId())
                .basePrice(new BigDecimal("100000"))
                .status(Product.ProductStatus.ACTIVE)
                .approvalStatus(Product.ApprovalStatus.APPROVED)
                .build();
        Product banned = Product.builder()
                .name("Banned Product " + suffix)
                .slug("banned-product-" + suffix)
                .sku("BAN-" + suffix)
                .storeId(store.getId())
                .basePrice(new BigDecimal("100000"))
                .status(Product.ProductStatus.ACTIVE)
                .approvalStatus(Product.ApprovalStatus.BANNED)
                .build();
        productRepository.save(approved);
        productRepository.save(banned);
        productAuditLogRepository.save(ProductAuditLog.builder()
                .productId(banned.getId())
                .adminId(vendor.getId())
                .action(ProductAuditLog.Action.BANNED)
                .reason("Hình ảnh sản phẩm vi phạm chính sách")
                .build());

        VendorProductPageResponse activePage = productService.getVendorProductPage(
                store.getId(),
                Product.ProductStatus.ACTIVE,
                null,
                null,
                null,
                null,
                PageRequest.of(0, 10)
        );
        VendorProductPageResponse allPage = productService.getVendorProductPage(
                store.getId(),
                null,
                null,
                null,
                null,
                null,
                PageRequest.of(0, 10)
        );
        VendorProductPageResponse bannedPage = productService.getVendorProductPage(
                store.getId(),
                null,
                Product.ApprovalStatus.BANNED,
                null,
                null,
                null,
                PageRequest.of(0, 10)
        );

        assertThat(activePage.getContent())
                .extracting(VendorProductSummaryResponse::getId)
                .containsExactly(approved.getId());
        assertThat(activePage.getStatusCounts().getActive()).isEqualTo(1);
        assertThat(activePage.getStatusCounts().getBanned()).isEqualTo(1);
        assertThat(bannedPage.getContent())
                .extracting(VendorProductSummaryResponse::getId)
                .containsExactly(banned.getId());
        assertThat(bannedPage.getContent().get(0).getModerationReason())
                .isEqualTo("Hình ảnh sản phẩm vi phạm chính sách");

        VendorProductSummaryResponse bannedRow = allPage.getContent().stream()
                .filter(row -> row.getId().equals(banned.getId()))
                .findFirst()
                .orElseThrow();
        assertThat(bannedRow.getStatus()).isEqualTo("ACTIVE");
        assertThat(bannedRow.getApprovalStatus()).isEqualTo("BANNED");
        assertThat(bannedRow.getModerationReason()).isEqualTo("Hình ảnh sản phẩm vi phạm chính sách");
        assertThat(bannedRow.getVisible()).isFalse();
    }
}
