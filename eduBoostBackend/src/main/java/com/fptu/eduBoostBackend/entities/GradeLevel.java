package com.fptu.eduBoostBackend.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "grade_levels")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GradeLevel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "grade_level_id")
    private Long gradeLevelId;

    @Column(name = "grade_name", nullable = false, unique = true, length = 50)
    private String gradeName;

    @Column(name = "description", length = 500)
    private String description;

    @OneToMany(mappedBy = "gradeLevel", fetch = FetchType.LAZY)
    private List<SchoolClass> classes;

}
