package com.fptu.eduBoostBackend.initializer;

import com.fptu.eduBoostBackend.entities.SubscriptionPlan;
import com.fptu.eduBoostBackend.entities.enums.BillingCycle;
import com.fptu.eduBoostBackend.repositories.SubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(10)
public class SubscriptionPlanInitializer implements ApplicationRunner {

    private final SubscriptionPlanRepository planRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (planRepository.count() > 0) return;

        log.info("Seeding subscription plans...");

        planRepository.save(SubscriptionPlan.builder()
                .planCode("FREE")
                .planName("Gói Miễn Phí")
                .price(BigDecimal.ZERO)
                .billingCycle(null)
                .durationDays(null)
                .maxClasses(1)
                .maxStudents(30)
                .maxExamsPerMonth(10)
                .maxAIRequestsPerMonth(20)
                .description("Dành cho giáo viên mới bắt đầu. Đầy đủ tính năng cơ bản.")
                .isActive(true)
                .build());

        planRepository.save(SubscriptionPlan.builder()
                .planCode("PRO_MONTHLY")
                .planName("Gói Pro Tháng")
                .price(new BigDecimal("139000"))
                .billingCycle(BillingCycle.MONTHLY)
                .durationDays(30)
                .maxClasses(null)     // unlimited
                .maxStudents(null)    // unlimited
                .maxExamsPerMonth(null)
                .maxAIRequestsPerMonth(null)
                .description("Không giới hạn lớp học, học sinh, đề thi và yêu cầu AI. Hỗ trợ ưu tiên.")
                .isActive(true)
                .build());

        planRepository.save(SubscriptionPlan.builder()
                .planCode("PRO_YEARLY")
                .planName("Gói Pro Năm")
                .price(new BigDecimal("1390000"))
                .billingCycle(BillingCycle.YEARLY)
                .durationDays(365)
                .maxClasses(null)
                .maxStudents(null)
                .maxExamsPerMonth(null)
                .maxAIRequestsPerMonth(null)
                .description("Tất cả tính năng của Pro Tháng với giá tiết kiệm hơn (bằng 10 tháng). Hỗ trợ ưu tiên.")
                .isActive(true)
                .build());

        log.info("Seeded 3 subscription plans: FREE, PRO_MONTHLY, PRO_YEARLY");
    }
}
