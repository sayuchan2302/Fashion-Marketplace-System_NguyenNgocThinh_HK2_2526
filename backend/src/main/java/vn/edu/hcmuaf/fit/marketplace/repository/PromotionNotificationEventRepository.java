package vn.edu.hcmuaf.fit.marketplace.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.hcmuaf.fit.marketplace.entity.PromotionNotificationEvent;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PromotionNotificationEventRepository extends JpaRepository<PromotionNotificationEvent, UUID> {

    Optional<PromotionNotificationEvent> findByEventKey(String eventKey);

    boolean existsByEventKey(String eventKey);

    @Query("""
            SELECT e
            FROM PromotionNotificationEvent e
            WHERE e.eventType IN :types
              AND e.endDate BETWEEN :fromDate AND :toDate
              AND e.status <> :cancelledStatus
            ORDER BY e.createdAt DESC
            """)
    List<PromotionNotificationEvent> findReminderRootCandidates(
            @Param("types") Collection<PromotionNotificationEvent.EventType> types,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("cancelledStatus") PromotionNotificationEvent.EventStatus cancelledStatus
    );
}
