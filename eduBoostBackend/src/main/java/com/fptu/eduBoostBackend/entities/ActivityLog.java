package com.fptu.eduBoostBackend.entities;

import com.fptu.eduBoostBackend.entities.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;

    private String userName;

    @Column(nullable = false, length = 500)
    private String action;
    @CreationTimestamp
    private LocalDateTime createdAt;
}