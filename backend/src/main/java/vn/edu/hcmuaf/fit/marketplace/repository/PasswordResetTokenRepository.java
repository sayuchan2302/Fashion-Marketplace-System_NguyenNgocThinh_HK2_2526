package vn.edu.hcmuaf.fit.marketplace.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.hcmuaf.fit.marketplace.entity.PasswordResetToken;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {

    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    @Modifying
    @Query("""
            UPDATE PasswordResetToken token
            SET token.usedAt = :usedAt
            WHERE token.user.id = :userId
              AND token.usedAt IS NULL
            """)
    int markUnusedTokensAsUsed(
            @Param("userId") UUID userId,
            @Param("usedAt") LocalDateTime usedAt
    );

    @Modifying
    @Query("""
            UPDATE PasswordResetToken token
            SET token.usedAt = :usedAt
            WHERE token.user.id = :userId
              AND token.id <> :tokenId
              AND token.usedAt IS NULL
            """)
    int markOtherUnusedTokensAsUsed(
            @Param("userId") UUID userId,
            @Param("tokenId") UUID tokenId,
            @Param("usedAt") LocalDateTime usedAt
    );
}
