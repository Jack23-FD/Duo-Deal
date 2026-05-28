package com.duodeals.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class SoloTaskRequest {

    @NotBlank(message = "Task name is required")
    private String taskName;

    private String taskTime;

    @NotNull(message = "Task date is required")
    private LocalDate taskDate;
}
