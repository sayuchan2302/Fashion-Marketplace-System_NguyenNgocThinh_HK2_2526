package vn.edu.hcmuaf.fit.fashionstore.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorOrderSummaryResponse {
    private UUID id;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Double total;
    private Double commissionFee;
    private Double vendorPayout;
    private Integer itemCount;
    private Customer customer;
    private String trackingNumber;
    private String shippingCarrier;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Customer {
        private String name;
        private String email;
        private String phone;
    }
}
