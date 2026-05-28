package com.duodeals.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "duel_tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DuelTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "duel_id", nullable = false)
    private Duel duel;

    @Column(name = "task_name", nullable = false, length = 255)
    private String taskName;

    @Column(name = "task_time", length = 50)
    private String taskTime;

    @Column(name = "task_order", nullable = false)
    private Integer taskOrder;
}
