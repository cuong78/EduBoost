package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    @Query("""
            SELECT a FROM ActivityLog a
            WHERE (:keyword IS NULL OR :keyword = ''
                OR LOWER(a.userName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(a.action) LIKE LOWER(CONCAT('%', :keyword, '%')))
            ORDER BY a.createdAt DESC
            """)
    Page<ActivityLog> searchLogs(@Param("keyword") String keyword, Pageable pageable);
}