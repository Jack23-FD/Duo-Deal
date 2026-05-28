package com.duodeals.backend.service;

import com.duodeals.backend.dto.ChangePasswordRequest;
import com.duodeals.backend.dto.ProfileStatsResponse;
import com.duodeals.backend.dto.UpdateProfileRequest;
import com.duodeals.backend.entity.Duel;
import com.duodeals.backend.entity.DuelStatus;
import com.duodeals.backend.entity.User;
import com.duodeals.backend.exception.BadRequestException;
import com.duodeals.backend.repository.DuelRepository;
import com.duodeals.backend.repository.DuelTaskCompletionRepository;
import com.duodeals.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final DuelRepository duelRepository;
    private final DuelTaskCompletionRepository duelTaskCompletionRepository;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;

    private void checkAndResetStreak(User user) {
        if (user.getLastStreakDate() != null) {
            LocalDate today = LocalDate.now();
            if (user.getLastStreakDate().isBefore(today.minusDays(1))) {
                user.setStreakDays(0);
                userRepository.save(user);
            }
        }
    }

    @Transactional
    public User getMe() {
        User user = authService.getAuthenticatedUser();
        checkAndResetStreak(user);
        return user;
    }

    @Transactional
    public User updateMe(UpdateProfileRequest request) {
        User user = authService.getAuthenticatedUser();

        if (request.getUsername() != null && !request.getUsername().isBlank() && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new BadRequestException("Username already exists");
            }
            user.setUsername(request.getUsername());
        }

        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }

        if (request.getProfilePhotoUrl() != null && !request.getProfilePhotoUrl().isBlank()) {
            user.setProfilePhotoUrl(request.getProfilePhotoUrl());
        }

        return userRepository.save(user);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = authService.getAuthenticatedUser();

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password does not match");
        }

        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public User incrementStreak() {
        User user = authService.getAuthenticatedUser();
        LocalDate today = LocalDate.now();
        if (user.getLastStreakDate() == null || !today.equals(user.getLastStreakDate())) {
            user.setStreakDays(user.getStreakDays() + 1);
            user.setLastStreakDate(today);
            return userRepository.save(user);
        }
        return user;
    }

    @Transactional
    public ProfileStatsResponse getAchievements() {
        User user = authService.getAuthenticatedUser();
        checkAndResetStreak(user);

        // 1. Fetch duels to calculate total deals completed
        List<Duel> duels = duelRepository.findByChallengerIdOrOpponentId(user.getId(), user.getId());
        long completedDealsCount = duels.stream()
                .filter(d -> d.getStatus() == DuelStatus.COMPLETED || d.getStatus() == DuelStatus.ACTIVE)
                .count();

        // 2. Fetch completions to calculate rate
        long totalCompletions = duelTaskCompletionRepository.findAll().stream()
                .filter(c -> c.getUser().getId().equals(user.getId()))
                .count();
        long completedCompletions = duelTaskCompletionRepository.findAll().stream()
                .filter(c -> c.getUser().getId().equals(user.getId()) && c.getIsCompleted())
                .count();

        double completionRate = 0.0;
        if (totalCompletions > 0) {
            completionRate = Math.round(((double) completedCompletions / totalCompletions) * 100.0);
        } else {
            completionRate = 75.0; // Seed nice default standard for demo/achievements if no data exists yet
        }

        // 3. Generate seed achievements/badges
        List<ProfileStatsResponse.BadgeDto> badges = new ArrayList<>();
        badges.add(ProfileStatsResponse.BadgeDto.builder()
                .badgeName("First Blood ⚔️")
                .badgeIcon("first_blood")
                .dateEarned(LocalDate.now().minusDays(5))
                .build());

        if (user.getStreakDays() >= 7) {
            badges.add(ProfileStatsResponse.BadgeDto.builder()
                    .badgeName("Streak Master 🔥")
                    .badgeIcon("streak_master")
                    .dateEarned(LocalDate.now().minusDays(3))
                    .build());
        }

        if (completionRate >= 90.0) {
            badges.add(ProfileStatsResponse.BadgeDto.builder()
                    .badgeName("Perfect Compliance 🎯")
                    .badgeIcon("perfect_compliance")
                    .dateEarned(LocalDate.now().minusDays(1))
                    .build());
        }

        if (completedDealsCount >= 3) {
            badges.add(ProfileStatsResponse.BadgeDto.builder()
                    .badgeName("Duo Conqueror 🏆")
                    .badgeIcon("duo_conqueror")
                    .dateEarned(LocalDate.now())
                    .build());
        }

        return ProfileStatsResponse.builder()
                .streakDays(user.getStreakDays())
                .totalDeals((int) completedDealsCount)
                .completionRate(completionRate)
                .totalXp(user.getTotalXp())
                .achievements(badges)
                .build();
    }
}
