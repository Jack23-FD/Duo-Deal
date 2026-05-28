package com.duodeals.backend.controller;

import com.duodeals.backend.dto.AuthResponse;
import com.duodeals.backend.entity.User;
import com.duodeals.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
        
        List<User> users = userRepository.findByUsernameContainingIgnoreCase(username.trim());
        
        List<AuthResponse.UserDetailsDto> dtos = users.stream()
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
