package com.duodeals.backend.repository;

import com.duodeals.backend.entity.DuelTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DuelTaskRepository extends JpaRepository<DuelTask, Long> {
    List<DuelTask> findByDuelIdOrderByTaskOrderAsc(Long duelId);
    List<DuelTask> findByDuelId(Long duelId);
}
