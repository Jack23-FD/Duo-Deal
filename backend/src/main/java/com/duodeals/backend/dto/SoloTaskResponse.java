package com.duodeals.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SoloTaskResponse {
    private Long id;
    private String taskName;
    private String taskTime;
    private LocalDate taskDate;
    private Boolean isCompleted;
}
