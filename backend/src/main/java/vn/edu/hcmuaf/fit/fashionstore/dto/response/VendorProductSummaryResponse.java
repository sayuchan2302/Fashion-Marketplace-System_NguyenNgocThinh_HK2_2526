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
public class VendorProductSummaryResponse {
    private UUID id;
    private String name;
    private String slug;
    private String description;
    private String status;
    private Boolean visible;
    private UUID categoryId;
    private String categoryName;
    private Double basePrice;
    private Double salePrice;
    private Double effectivePrice;
    private Integer totalStock;
    private String primarySku;
    private String primaryImage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
