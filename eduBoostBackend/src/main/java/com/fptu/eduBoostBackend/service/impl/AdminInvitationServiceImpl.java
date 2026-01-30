package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.dto.response.ExpiringInvitationResponse;
import com.fptu.eduBoostBackend.dto.response.InvitationCleanupResponse;
import com.fptu.eduBoostBackend.dto.response.InvitationDetailResponse;
import com.fptu.eduBoostBackend.dto.response.InvitationStatsResponse;
import com.fptu.eduBoostBackend.entities.Parent;
import com.fptu.eduBoostBackend.entities.ParentStudent;
import com.fptu.eduBoostBackend.entities.Student;
import com.fptu.eduBoostBackend.entities.StudentInvitation;
import com.fptu.eduBoostBackend.entities.User;
import com.fptu.eduBoostBackend.entities.enums.InvitationStatus;
import com.fptu.eduBoostBackend.exception.exceptions.ResourceNotFoundException;
import com.fptu.eduBoostBackend.repositories.ParentStudentRepository;
import com.fptu.eduBoostBackend.repositories.StudentInvitationRepository;
import com.fptu.eduBoostBackend.service.AdminInvitationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminInvitationServiceImpl implements AdminInvitationService {

    private final StudentInvitationRepository studentInvitationRepository;
    private final ParentStudentRepository parentStudentRepository;

    @Override
    @Transactional(readOnly = true)
    public InvitationStatsResponse getInvitationStats() {
        log.info("Getting invitation statistics");

        long total = studentInvitationRepository.count();
        long active = studentInvitationRepository.countByStatus(InvitationStatus.ACTIVE);
        long used = studentInvitationRepository.countByStatus(InvitationStatus.USED);
        long expired = studentInvitationRepository.countByStatus(InvitationStatus.EXPIRED);
        long revoked = studentInvitationRepository.countByStatus(InvitationStatus.REVOKED);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime in7Days = now.plusDays(7);
        LocalDateTime in30Days = now.plusDays(30);

        List<StudentInvitation> expiringIn7 = studentInvitationRepository
                .findExpiringInvitations(InvitationStatus.ACTIVE, now, in7Days);
        List<StudentInvitation> expiringIn30 = studentInvitationRepository
                .findExpiringInvitations(InvitationStatus.ACTIVE, now, in30Days);

        return InvitationStatsResponse.builder()
                .total(total)
                .active(active)
                .used(used)
                .expired(expired)
                .revoked(revoked)
                .expiringIn7Days(expiringIn7.size())
                .expiringIn30Days(expiringIn30.size())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpiringInvitationResponse> getExpiringInvitations(Integer days) {
        if (days == null || days <= 0) {
            days = 7; // Default 7 days
        }

        log.info("Getting invitations expiring in {} days", days);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime futureDate = now.plusDays(days);

        List<StudentInvitation> expiringInvitations = studentInvitationRepository
                .findExpiringInvitations(InvitationStatus.ACTIVE, now, futureDate);

        return expiringInvitations.stream()
                .map(this::convertToExpiringInvitationResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public InvitationCleanupResponse cleanupExpiredInvitations() {
        log.info("Starting cleanup of expired invitations");

        LocalDateTime now = LocalDateTime.now();

        // Tìm và cập nhật status của các invitation đã hết hạn
        List<StudentInvitation> expiredInvitations = studentInvitationRepository
                .findExpiredActiveInvitations(now);

        int count = 0;
        for (StudentInvitation invitation : expiredInvitations) {
            invitation.setStatus(InvitationStatus.EXPIRED);
            studentInvitationRepository.save(invitation);
            count++;
        }

        log.info("Cleaned up {} expired invitations", count);

        return InvitationCleanupResponse.builder()
                .deletedCount(count)
                .message("Successfully marked " + count + " expired invitations as EXPIRED")
                .build();
    }

    private ExpiringInvitationResponse convertToExpiringInvitationResponse(StudentInvitation invitation) {
        Student student = invitation.getStudent();
        long daysUntilExpiry = ChronoUnit.DAYS.between(LocalDateTime.now(), invitation.getExpiresAt());

        return ExpiringInvitationResponse.builder()
                .invitationId(invitation.getInvitationId())
                .invitationCode(invitation.getInvitationCode())
                .studentCode(student.getStudentCode())
                .studentName(student.getUser().getFullName() != null ? 
                        student.getUser().getFullName() : student.getUser().getUsername())
                .className(student.getClassEntity() != null ? 
                        student.getClassEntity().getClassName() : "N/A")
                .createdByEmail(invitation.getCreatedBy().getEmail())
                .createdAt(invitation.getCreatedAt())
                .expiresAt(invitation.getExpiresAt())
                .status(invitation.getStatus())
                .daysUntilExpiry(daysUntilExpiry)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvitationDetailResponse> getAllInvitations() {
        log.info("Getting all invitations");
        List<StudentInvitation> invitations = studentInvitationRepository.findAll();
        return invitations.stream()
                .map(this::convertToInvitationDetailResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public InvitationDetailResponse getInvitationDetail(String invitationId) {
        log.info("Getting invitation detail: {}", invitationId);
        StudentInvitation invitation = studentInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));
        return convertToInvitationDetailResponse(invitation);
    }

    private InvitationDetailResponse convertToInvitationDetailResponse(StudentInvitation invitation) {
        Student student = invitation.getStudent();
        User createdByUser = invitation.getCreatedBy();

        // Student info
        InvitationDetailResponse.StudentInfoDTO studentDTO = InvitationDetailResponse.StudentInfoDTO.builder()
                .studentId(student.getStudentId())
                .studentCode(student.getStudentCode())
                .fullName(student.getUser().getFullName() != null ? 
                        student.getUser().getFullName() : student.getUser().getUsername())
                .email(student.getUser().getEmail())
                .className(student.getClassEntity() != null ? 
                        student.getClassEntity().getClassName() : "N/A")
                .build();

        // Created by info
        InvitationDetailResponse.CreatedByDTO createdByDTO = InvitationDetailResponse.CreatedByDTO.builder()
                .userId(createdByUser.getUserId().toString())
                .username(createdByUser.getUsername())
                .email(createdByUser.getEmail())
                .fullName(createdByUser.getFullName())
                .build();

        // Used by info (if used)
        InvitationDetailResponse.UsedByDTO usedByDTO = null;
        if (invitation.getUsedBy() != null) {
            Parent parent = invitation.getUsedBy();
            User parentUser = parent.getUser();
            
            // Tìm relationship từ parent_student
            ParentStudent parentStudent = parentStudentRepository
                    .findByParentAndStudent(parent, student)
                    .orElse(null);

            usedByDTO = InvitationDetailResponse.UsedByDTO.builder()
                    .parentId(parent.getParentId())
                    .username(parentUser.getUsername())
                    .email(parentUser.getEmail())
                    .fullName(parentUser.getFullName())
                    .relationship(parentStudent != null ? parentStudent.getRelationship() : null)
                    .build();
        }

        return InvitationDetailResponse.builder()
                .invitationId(invitation.getInvitationId())
                .invitationCode(invitation.getInvitationCode())
                .invitationType(invitation.getInvitationType())
                .status(invitation.getStatus())
                .recipientEmail(invitation.getRecipientEmail())
                .recipientPhone(invitation.getRecipientPhone())
                .createdAt(invitation.getCreatedAt())
                .expiresAt(invitation.getExpiresAt())
                .usedAt(invitation.getUsedAt())
                .student(studentDTO)
                .createdBy(createdByDTO)
                .usedBy(usedByDTO)
                .build();
    }
}
