package com.duodeals.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "duel_task_completions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DuelTaskCompletion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "duel_task_id", nullable = false)
    private DuelTask duelTask;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "completion_date", nullable = false)
    private LocalDate completionDate;

    @Builder.Default
    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted = false;

    @PrePersist
    protected void onCreate() {
        if (isCompleted == null) isCompleted = false;
    }
}
