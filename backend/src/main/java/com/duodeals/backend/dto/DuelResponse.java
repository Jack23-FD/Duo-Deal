package com.duodeals.backend.dto;

import com.duodeals.backend.entity.DuelStatus;
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
public class DuelResponse {
    private Long id;
    private String challengerUsername;
    private String opponentUsername;
    private String challengerName;
    private String opponentName;
    private LocalDate startDate;
    private LocalDate endDate;
    private DuelStatus status;
    private Integer challengerCompletionRate;
    private Integer opponentCompletionRate;
    private List<DuelTaskDto> tasks;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DuelTaskDto {
        private Long id;
        private String taskName;
        private String taskTime;
        private Integer taskOrder;
    }
}
