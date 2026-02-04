package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.CognitiveLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CognitiveLevelRepository extends JpaRepository<CognitiveLevel, Long> {
    List<CognitiveLevel> findAllByOrderByDisplayOrderAsc();
}
