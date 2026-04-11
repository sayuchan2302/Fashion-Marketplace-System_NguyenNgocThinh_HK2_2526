package vn.edu.hcmuaf.fit.marketplace.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class CartResponse {
    private UUID id;
    private BigDecimal totalAmount;
    private List<CartItemData> items;

    @Data
    @Builder
    public static class CartItemData {
        private UUID id;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
        private ProductData product;
        private VariantData variant;
    }

    @Data
    @Builder
    public static class ProductData {
        private UUID id;
        private String name;
        private BigDecimal basePrice;
        private BigDecimal salePrice;
        private BigDecimal effectivePrice;
        private String imageUrl;
        private UUID storeId;
        private String storeName;
        private Boolean officialStore;
    }

    @Data
    @Builder
    public static class VariantData {
        private UUID id;
        private String color;
        private String size;
    }
}
