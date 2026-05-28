package com.duodeals.backend.controller;

import com.duodeals.backend.dto.AuthResponse;
import com.duodeals.backend.entity.User;
import com.duodeals.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/search")
    public ResponseEntity<List<AuthResponse.UserDetailsDto>> searchUsers(@RequestParam("username") String username) {
        if (username == null || username.trim().length() < 3) {
            return ResponseEntity.ok(List.of());
        }

        // Get the currently logged-in username to exclude from results
        String currentUsername = null;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            currentUsername = auth.getName();
        }
        final String excludeUsername = currentUsername;
        
        List<User> users = userRepository.findByUsernameContainingIgnoreCase(username.trim());
        
        List<AuthResponse.UserDetailsDto> dtos = users.stream()
                .filter(user -> excludeUsername == null || !user.getUsername().equalsIgnoreCase(excludeUsername))
                .map(user -> AuthResponse.UserDetailsDto.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .profilePhotoUrl(user.getProfilePhotoUrl())
                        .bio(user.getBio())
                        .streakDays(user.getStreakDays())
                        .totalXp(user.getTotalXp())
                        .build())
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(dtos);
    }
}
