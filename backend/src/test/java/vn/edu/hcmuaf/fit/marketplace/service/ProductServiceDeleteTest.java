package vn.edu.hcmuaf.fit.marketplace.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.edu.hcmuaf.fit.marketplace.entity.Product;
import vn.edu.hcmuaf.fit.marketplace.repository.CategoryRepository;
import vn.edu.hcmuaf.fit.marketplace.repository.OrderRepository;
import vn.edu.hcmuaf.fit.marketplace.repository.ProductRepository;
import vn.edu.hcmuaf.fit.marketplace.repository.ProductVariantRepository;
import vn.edu.hcmuaf.fit.marketplace.repository.StoreRepository;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceDeleteTest {

    @Mock
    private ProductRepository productRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private ProductVariantRepository productVariantRepository;
    @Mock
    private StoreRepository storeRepository;
    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private ProductService productService;

    @Test
    void deleteArchivesProductInsteadOfLeavingItInactive() {
        UUID productId = UUID.randomUUID();
        Product product = Product.builder()
                .id(productId)
                .status(Product.ProductStatus.ACTIVE)
                .build();

        when(productRepository.findById(productId)).thenReturn(Optional.of(product));

        productService.delete(productId);

        assertEquals(Product.ProductStatus.ARCHIVED, product.getStatus());
        verify(productRepository).save(product);
    }

    @Test
    void deleteForStoreArchivesOwnedProductInsteadOfLeavingItInactive() {
        UUID productId = UUID.randomUUID();
        UUID storeId = UUID.randomUUID();
        Product product = Product.builder()
                .id(productId)
                .storeId(storeId)
                .status(Product.ProductStatus.DRAFT)
                .build();

        when(productRepository.findByIdAndStoreId(productId, storeId)).thenReturn(Optional.of(product));

        productService.deleteForStore(productId, storeId);

        assertEquals(Product.ProductStatus.ARCHIVED, product.getStatus());
        verify(productRepository).save(product);
    }
}
