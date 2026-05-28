package com.duodeals.backend.controller;

import com.duodeals.backend.dto.AuthResponse;
import com.duodeals.backend.dto.ChangePasswordRequest;
import com.duodeals.backend.dto.ProfileStatsResponse;
import com.duodeals.backend.dto.UpdateProfileRequest;
import com.duodeals.backend.entity.User;
import com.duodeals.backend.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<AuthResponse.UserDetailsDto> getMyProfile() {
        User user = profileService.getMe();
        return ResponseEntity.ok(mapToDetailsDto(user));
    }

    @PutMapping
    public ResponseEntity<AuthResponse.UserDetailsDto> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        User user = profileService.updateMe(request);
        return ResponseEntity.ok(mapToDetailsDto(user));
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        profileService.changePassword(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/streak/increment")
    public ResponseEntity<AuthResponse.UserDetailsDto> incrementStreak() {
        User user = profileService.incrementStreak();
        return ResponseEntity.ok(mapToDetailsDto(user));
    }

    @GetMapping("/achievements")
    public ResponseEntity<ProfileStatsResponse> getAchievements() {
        return ResponseEntity.ok(profileService.getAchievements());
    }

    private AuthResponse.UserDetailsDto mapToDetailsDto(User user) {
        return AuthResponse.UserDetailsDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .profilePhotoUrl(user.getProfilePhotoUrl())
                .bio(user.getBio())
                .streakDays(user.getStreakDays())
                .totalXp(user.getTotalXp())
                .build();
    }
}
