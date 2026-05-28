package com.duodeals.backend.repository;

import com.duodeals.backend.entity.DuelTaskCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DuelTaskCompletionRepository extends JpaRepository<DuelTaskCompletion, Long> {
    Optional<DuelTaskCompletion> findByDuelTaskIdAndUserIdAndCompletionDate(Long duelTaskId, Long userId, LocalDate completionDate);
    List<DuelTaskCompletion> findByDuelTaskDuelIdAndUserIdAndCompletionDate(Long duelId, Long userId, LocalDate completionDate);
    List<DuelTaskCompletion> findByDuelTaskDuelIdAndCompletionDate(Long duelId, LocalDate completionDate);
    List<DuelTaskCompletion> findByDuelTaskDuelIdAndUserId(Long duelId, Long userId);
    int countByDuelTaskDuelIdAndUserIdAndIsCompleted(Long duelId, Long userId, Boolean isCompleted);
    int countByDuelTaskDuelIdAndUserIdAndIsCompletedAndCompletionDateBefore(Long duelId, Long userId, Boolean isCompleted, LocalDate date);
}

