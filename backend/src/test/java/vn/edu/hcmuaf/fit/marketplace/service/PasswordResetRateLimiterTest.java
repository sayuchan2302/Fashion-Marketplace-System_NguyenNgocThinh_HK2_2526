package vn.edu.hcmuaf.fit.marketplace.service;

import org.junit.jupiter.api.Test;
import vn.edu.hcmuaf.fit.marketplace.config.PasswordResetProperties;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PasswordResetRateLimiterTest {

    @Test
    void allowRejectsWhenEmailLimitIsExceeded() {
        PasswordResetProperties properties = new PasswordResetProperties();
        properties.setMaxRequestsPerHour(2);
        MutableClock clock = new MutableClock(Instant.parse("2026-05-16T10:00:00Z"));
        PasswordResetRateLimiter limiter = new PasswordResetRateLimiter(properties, clock);

        assertTrue(limiter.allow("customer@test.local", "127.0.0.1"));
        assertTrue(limiter.allow("customer@test.local", "127.0.0.2"));
        assertFalse(limiter.allow("customer@test.local", "127.0.0.3"));

        clock.now = Instant.parse("2026-05-16T11:01:00Z");
        assertTrue(limiter.allow("customer@test.local", "127.0.0.3"));
    }

    @Test
    void allowRejectsWhenIpLimitIsExceeded() {
        PasswordResetProperties properties = new PasswordResetProperties();
        properties.setMaxRequestsPerHour(2);
        MutableClock clock = new MutableClock(Instant.parse("2026-05-16T10:00:00Z"));
        PasswordResetRateLimiter limiter = new PasswordResetRateLimiter(properties, clock);

        assertTrue(limiter.allow("first@test.local", "127.0.0.1"));
        assertTrue(limiter.allow("second@test.local", "127.0.0.1"));
        assertFalse(limiter.allow("third@test.local", "127.0.0.1"));
    }

    private static final class MutableClock extends Clock {
        private Instant now;

        private MutableClock(Instant now) {
            this.now = now;
        }

        @Override
        public ZoneId getZone() {
            return ZoneId.of("UTC");
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return now;
        }
    }
}
