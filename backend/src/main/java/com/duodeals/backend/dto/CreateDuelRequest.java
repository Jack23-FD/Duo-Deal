package com.duodeals.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class CreateDuelRequest {

    private String opponentUsernameOrEmail;
    
    private Long opponentId;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotEmpty(message = "At least one daily task must be specified")
    private List<DuelTaskRequest> tasks;

    @Data
    public static class DuelTaskRequest {
        @NotBlank(message = "Task name is required")
        private String taskName;
        private String taskTime;
    }
}
