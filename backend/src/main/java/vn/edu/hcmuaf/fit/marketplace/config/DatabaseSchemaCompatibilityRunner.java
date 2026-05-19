package vn.edu.hcmuaf.fit.marketplace.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(0)
@RequiredArgsConstructor
public class DatabaseSchemaCompatibilityRunner implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        replaceEnumCheckConstraint(
                "products",
                "approval_status",
                "products_approval_status_check",
                "'PENDING', 'APPROVED', 'REJECTED', 'BANNED', 'UNDER_REVIEW'"
        );
        replaceEnumCheckConstraint(
                "product_audit_logs",
                "action",
                "product_audit_logs_action_check",
                "'APPROVED', 'BANNED', 'REJECTED', 'BULK_APPROVED', 'REPORT_CONFIRMED', 'REPORT_DISMISSED'"
        );
        replaceEnumCheckConstraint(
                "product_reports",
                "status",
                "product_reports_status_check",
                "'PENDING', 'CONFIRMED', 'DISMISSED'"
        );
    }

    private void replaceEnumCheckConstraint(
            String tableName,
            String columnName,
            String constraintName,
            String allowedValuesSql
    ) {
        jdbcTemplate.execute("""
                DO $$
                DECLARE
                    constraint_record record;
                BEGIN
                    IF to_regclass('%s') IS NULL THEN
                        RETURN;
                    END IF;

                    FOR constraint_record IN
                        SELECT n.nspname, t.relname, c.conname
                        FROM pg_constraint c
                        JOIN pg_class t ON t.oid = c.conrelid
                        JOIN pg_namespace n ON n.oid = t.relnamespace
                        WHERE t.relname = '%s'
                          AND c.contype = 'c'
                          AND pg_get_constraintdef(c.oid) ILIKE '%%%s%%'
                    LOOP
                        EXECUTE format(
                            'ALTER TABLE %%I.%%I DROP CONSTRAINT %%I',
                            constraint_record.nspname,
                            constraint_record.relname,
                            constraint_record.conname
                        );
                    END LOOP;
                END $$;
                """.formatted(tableName, tableName, columnName));

        jdbcTemplate.execute("""
                ALTER TABLE %s
                ADD CONSTRAINT %s
                CHECK (
                    %s IS NULL
                    OR %s IN (%s)
                )
                """.formatted(tableName, constraintName, columnName, columnName, allowedValuesSql));
    }
}
