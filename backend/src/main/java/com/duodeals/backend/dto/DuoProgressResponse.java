package com.duodeals.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DuoProgressResponse {
    private Long duelId;
    private String challengerName;
    private String opponentName;
    private Integer challengerCompletionRate;
    private Integer opponentCompletionRate;
    private Map<String, Map<String, Map<String, Boolean>>> dailyProgress;
}
