package com.duodeals.backend.controller;

import com.duodeals.backend.entity.Notification;
import com.duodeals.backend.entity.User;
import com.duodeals.backend.repository.NotificationRepository;
import com.duodeals.backend.service.AuthService;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final AuthService authService;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NotificationDto {
        private Long id;
        private String message;
        private Boolean isRead;
        private String createdAt;
    }

    @GetMapping
    @Transactional
    public ResponseEntity<List<NotificationDto>> getMyNotifications() {
        User user = authService.getAuthenticatedUser();
        
        // 1. Auto-delete old notifications (older than 24 hours / 1 day)
        LocalDateTime oneDayAgo = LocalDateTime.now().minusDays(1);
        List<Notification> activeList = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        List<Notification> oldNotifications = activeList.stream()
                .filter(n -> n.getCreatedAt() != null && n.getCreatedAt().isBefore(oneDayAgo))
                .collect(Collectors.toList());
        
        if (!oldNotifications.isEmpty()) {
            notificationRepository.deleteAll(oldNotifications);
        }
        
        // 2. Fetch fresh active notifications
        List<Notification> freshNotifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        
        List<NotificationDto> dtos = freshNotifications.stream()
                .map(n -> NotificationDto.builder()
                        .id(n.getId())
                        .message(n.getMessage())
                        .isRead(n.getIsRead())
                        .createdAt(n.getCreatedAt() != null ? n.getCreatedAt().toString() : LocalDateTime.now().toString())
                        .build())
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/mark-read")
    @Transactional
    public ResponseEntity<Void> markAllAsRead() {
        User user = authService.getAuthenticatedUser();
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.getId());
        for (Notification n : unread) {
            n.setIsRead(true);
        }
        if (!unread.isEmpty()) {
            notificationRepository.saveAll(unread);
        }
        return ResponseEntity.ok().build();
    }
}

