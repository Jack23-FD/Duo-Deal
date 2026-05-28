package com.duodeals.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileStatsResponse {
    private Integer streakDays;
    private Integer totalDeals;
    private Double completionRate;
    private Integer totalXp;
    private List<BadgeDto> achievements;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BadgeDto {
        private String badgeName;
        private String badgeIcon;
        private LocalDate dateEarned;
    }
}
