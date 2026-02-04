package com.fptu.eduBoostBackend.entities;

import com.fptu.eduBoostBackend.entities.enums.LessonResourceType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "lesson_resource")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonResource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Column(name = "resource_name", length = 200)
    private String resourceName;

    @Enumerated(EnumType.STRING)
    @Column(name = "resource_type", length = 20)
    private LessonResourceType resourceType;

    @Column(name = "file_path", length = 500)
    private String filePath;

    @Column(name = "file_url", length = 500)
    private String fileUrl;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "extracted_content", columnDefinition = "TEXT")
    private String extractedContent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    @CreationTimestamp
    @Column(name = "uploaded_at", updatable = false)
    private LocalDateTime uploadedAt;
}

