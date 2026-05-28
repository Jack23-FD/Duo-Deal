package com.duodeals.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private UserDetailsDto user;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserDetailsDto {
        private Long id;
        private String username;
        private String email;
        private String profilePhotoUrl;
        private String bio;
        
        @JsonProperty("streakDays")
        private Integer streakDays;
        
        private Integer totalXp;
    }
}
