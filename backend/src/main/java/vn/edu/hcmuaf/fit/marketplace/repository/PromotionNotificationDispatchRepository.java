package vn.edu.hcmuaf.fit.marketplace.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.hcmuaf.fit.marketplace.entity.PromotionNotificationDispatch;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface PromotionNotificationDispatchRepository extends JpaRepository<PromotionNotificationDispatch, UUID> {

    long countByEventId(UUID eventId);

    long countByEventIdAndDispatchStatusIn(UUID eventId, Collection<PromotionNotificationDispatch.DispatchStatus> statuses);

    @Query("""
            SELECT DISTINCT d.user.id
            FROM PromotionNotificationDispatch d
            WHERE d.event.id = :eventId
            """)
    List<UUID> findDistinctUserIdsByEventId(@Param("eventId") UUID eventId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT d
            FROM PromotionNotificationDispatch d
            JOIN FETCH d.event e
            JOIN FETCH d.user u
            WHERE d.dispatchStatus IN :statuses
              AND (d.nextRetryAt IS NULL OR d.nextRetryAt <= :now)
            ORDER BY d.createdAt ASC
            """)
    List<PromotionNotificationDispatch> findDueDispatchesForUpdate(
            @Param("statuses") Collection<PromotionNotificationDispatch.DispatchStatus> statuses,
            @Param("now") LocalDateTime now,
            Pageable pageable
    );
}
