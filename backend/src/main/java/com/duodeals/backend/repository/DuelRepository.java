package com.duodeals.backend.repository;

import com.duodeals.backend.entity.Duel;
import com.duodeals.backend.entity.DuelStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface DuelRepository extends JpaRepository<Duel, Long> {
    List<Duel> findByChallengerIdAndStatusOrOpponentIdAndStatus(Long challengerId, DuelStatus status1, Long opponentId, DuelStatus status2);
    List<Duel> findByChallengerIdOrOpponentId(Long challengerId, Long opponentId);
    List<Duel> findByOpponentIdAndStatus(Long opponentId, DuelStatus status);

    @Query("SELECT d FROM Duel d WHERE (d.challenger.id = :userId OR d.opponent.id = :userId) AND d.status = 'ACTIVE'")
    List<Duel> findActiveByUserId(@Param("userId") Long userId);
}
