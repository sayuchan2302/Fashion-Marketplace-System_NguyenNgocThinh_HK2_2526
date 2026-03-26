package vn.edu.hcmuaf.fit.fashionstore.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.hcmuaf.fit.fashionstore.entity.ProductVariant;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, UUID> {

    Optional<ProductVariant> findBySku(String sku);

    Optional<ProductVariant> findByProductIdAndColorAndSize(UUID productId, String color, String size);

    @Query("""
            SELECT v FROM ProductVariant v
            WHERE UPPER(v.sku) = UPPER(:sku)
              AND v.product.id <> :productId
            """)
    Optional<ProductVariant> findConflictingSku(@Param("sku") String sku, @Param("productId") UUID productId);
}
