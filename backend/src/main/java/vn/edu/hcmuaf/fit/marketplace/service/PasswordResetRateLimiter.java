package vn.edu.hcmuaf.fit.marketplace.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import vn.edu.hcmuaf.fit.marketplace.config.PasswordResetProperties;

import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayDeque;
import java.util.Iterator;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PasswordResetRateLimiter {

    private final PasswordResetProperties properties;
    private final Clock clock;
    private final Map<String, ArrayDeque<Instant>> requestsByKey = new ConcurrentHashMap<>();

    @Autowired
    public PasswordResetRateLimiter(PasswordResetProperties properties) {
        this(properties, Clock.systemUTC());
    }

    PasswordResetRateLimiter(PasswordResetProperties properties, Clock clock) {
        this.properties = properties;
        this.clock = clock;
    }

    public boolean allow(String email, String clientIp) {
        int maxRequests = properties.getMaxRequestsPerHour();
        if (maxRequests <= 0) {
            return true;
        }

        Instant now = clock.instant();
        Instant floor = now.minus(1, ChronoUnit.HOURS);
        String emailKey = "email:" + normalize(email);
        String ipKey = "ip:" + normalize(clientIp);

        synchronized (this) {
            ArrayDeque<Instant> emailRequests = cleanWindow(emailKey, floor);
            ArrayDeque<Instant> ipRequests = cleanWindow(ipKey, floor);
            if (emailRequests.size() >= maxRequests || ipRequests.size() >= maxRequests) {
                return false;
            }

            emailRequests.addLast(now);
            ipRequests.addLast(now);
            return true;
        }
    }

    @Scheduled(fixedDelayString = "${app.password-reset.rate-limit-cleanup-ms:60000}")
    public void cleanup() {
        Instant floor = clock.instant().minus(1, ChronoUnit.HOURS);
        synchronized (this) {
            for (Map.Entry<String, ArrayDeque<Instant>> entry : requestsByKey.entrySet()) {
                removeOlderThan(entry.getValue(), floor);
                if (entry.getValue().isEmpty()) {
                    requestsByKey.remove(entry.getKey(), entry.getValue());
                }
            }
        }
    }

    private ArrayDeque<Instant> cleanWindow(String key, Instant floor) {
        ArrayDeque<Instant> requests = requestsByKey.computeIfAbsent(key, ignored -> new ArrayDeque<>());
        removeOlderThan(requests, floor);
        return requests;
    }

    private void removeOlderThan(ArrayDeque<Instant> requests, Instant floor) {
        Iterator<Instant> iterator = requests.iterator();
        while (iterator.hasNext()) {
            if (!iterator.next().isBefore(floor)) {
                break;
            }
            iterator.remove();
        }
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return "unknown";
        }
        return value.trim().toLowerCase(Locale.ROOT);
    }
}
