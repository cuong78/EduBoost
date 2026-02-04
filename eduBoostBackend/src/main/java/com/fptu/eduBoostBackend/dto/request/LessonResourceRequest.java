package com.fptu.eduBoostBackend.dto.request;

import com.fptu.eduBoostBackend.entities.enums.LessonResourceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LessonResourceRequest {

    @NotNull(message = "Lesson ID cannot be null")
    private Long lessonId;

    @Size(max = 200, message = "Resource name must not exceed 200 characters")
    private String resourceName;

    @NotNull(message = "Resource type cannot be null")
    private LessonResourceType resourceType;

    // For URL resources
    @Size(max = 500, message = "File URL must not exceed 500 characters")
    private String fileUrl;

    // For text content (alternative to file upload)
    private String textContent;
}