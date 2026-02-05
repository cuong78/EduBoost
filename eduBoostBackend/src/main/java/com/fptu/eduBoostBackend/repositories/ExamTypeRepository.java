package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.ExamType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamTypeRepository extends JpaRepository<ExamType, Long> {
    
    @Query("SELECT e FROM ExamType e ORDER BY e.displayOrder ASC, e.id ASC")
    List<ExamType> findAllOrdered();
    
    Optional<ExamType> findByTypeCode(String typeCode);
    
    boolean existsByTypeCode(String typeCode);
}
