package com.duodeals.backend.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    
    @Size(max = 50, message = "Username must not exceed 50 characters")
    private String username;

    @Size(max = 300, message = "Bio must not exceed 300 characters")
    private String bio;

    private String profilePhotoUrl;
}
