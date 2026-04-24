package vn.edu.hcmuaf.fit.marketplace.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import vn.edu.hcmuaf.fit.marketplace.util.UploadPathResolver;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class StoreImageStorageService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp", "gif");
    private static final Map<String, String> CONTENT_TYPE_TO_EXTENSION = Map.of(
            "image/jpeg", "jpg",
            "image/png", "png",
            "image/webp", "webp",
            "image/gif", "gif"
    );

    private final Path storeDirectory;
    private final long maxStoreImageSizeBytes;

    public StoreImageStorageService(
            @Value("${app.upload.base-dir:backend/upload}") String baseUploadDir,
            @Value("${app.upload.max-store-image-size-bytes:5242880}") long maxStoreImageSizeBytes
    ) {
        Path basePath = UploadPathResolver.resolveBaseUploadPath(baseUploadDir);
        this.storeDirectory = basePath.resolve("stores").normalize();
        this.maxStoreImageSizeBytes = maxStoreImageSizeBytes;
        try {
            Files.createDirectories(this.storeDirectory);
        } catch (IOException e) {
            throw new IllegalStateException("Cannot initialize store image upload directory", e);
        }
    }

    public String storeStoreImage(MultipartFile file) {
        validateFile(file);

        String extension = resolveExtension(file);
        String filename = "store-" + UUID.randomUUID() + "." + extension;
        Path target = storeDirectory.resolve(filename).normalize();
        if (!target.startsWith(storeDirectory)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid upload path");
        }

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Cannot save store image");
        }

        return "/uploads/stores/" + filename;
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Store image file is required");
        }
        if (file.getSize() > maxStoreImageSizeBytes) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Store image file is too large");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Store image must be an image file");
        }
    }

    private String resolveExtension(MultipartFile file) {
        String original = file.getOriginalFilename();
        if (original != null) {
            int dotIndex = original.lastIndexOf('.');
            if (dotIndex >= 0 && dotIndex < original.length() - 1) {
                String extension = original.substring(dotIndex + 1).toLowerCase();
                if (ALLOWED_EXTENSIONS.contains(extension)) {
                    return extension;
                }
            }
        }

        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        String fromContentType = CONTENT_TYPE_TO_EXTENSION.get(contentType);
        if (fromContentType != null) {
            return fromContentType;
        }

        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported store image format");
    }
}
