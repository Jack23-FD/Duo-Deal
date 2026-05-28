package com.duodeals.backend.repository;

import com.duodeals.backend.entity.SoloTask;
import com.duodeals.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface SoloTaskRepository extends JpaRepository<SoloTask, Long> {
    List<SoloTask> findByUserAndTaskDate(User user, LocalDate taskDate);
    List<SoloTask> findByUserIdAndTaskDate(Long userId, LocalDate taskDate);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT t.taskDate FROM SoloTask t WHERE t.user.id = :userId AND t.taskDate < :date ORDER BY t.taskDate DESC")
    List<LocalDate> findRecentTaskDates(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("date") LocalDate date);
}
