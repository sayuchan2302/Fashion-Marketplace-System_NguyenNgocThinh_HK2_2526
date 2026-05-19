package vn.edu.hcmuaf.fit.marketplace.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.Test;
import vn.edu.hcmuaf.fit.marketplace.config.VisionSearchProperties;

import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.assertEquals;

class VisionAdminClientTest {

    @Test
    void getIndexInfoSendsInternalSecret() throws Exception {
        AtomicReference<String> capturedSecret = new AtomicReference<>();
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/v1/index/info", exchange -> {
            capturedSecret.set(exchange.getRequestHeaders()
                    .getFirst("X-Vision-Internal-Secret"));
            byte[] body = """
                    {
                      "ready": true,
                      "model_name": "ViT-B-32",
                      "model_pretrained": "laion2b_s34b_b79k",
                      "embedding_dimension": 512,
                      "active_image_count": 12,
                      "active_product_count": 5,
                      "index_version": "sync-token"
                    }
                    """.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, body.length);
            try (OutputStream outputStream = exchange.getResponseBody()) {
                outputStream.write(body);
            }
        });
        server.start();

        try {
            VisionSearchProperties properties = new VisionSearchProperties();
            properties.setEnabled(true);
            properties.setBaseUrl("http://127.0.0.1:" + server.getAddress().getPort());
            properties.setInternalSecret("secret");

            VisionAdminClient client = new VisionAdminClient(properties, new ObjectMapper());
            VisionAdminClient.IndexInfoPayload response = client.getIndexInfo();

            assertEquals("secret", capturedSecret.get());
            assertEquals("sync-token", response.indexVersion());
            assertEquals(12L, response.activeImageCount());
        } finally {
            server.stop(0);
        }
    }
}
