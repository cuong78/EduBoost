package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {
    List<SubscriptionPlan> findByIsActiveTrueOrderByPriceAsc();
    Optional<SubscriptionPlan> findByPlanCode(String planCode);
}
