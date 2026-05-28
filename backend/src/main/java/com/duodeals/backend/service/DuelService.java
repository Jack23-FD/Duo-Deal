package com.duodeals.backend.service;

import com.duodeals.backend.dto.CreateDuelRequest;
import com.duodeals.backend.dto.DuelResponse;
import com.duodeals.backend.dto.DuoProgressResponse;
import com.duodeals.backend.entity.*;
import com.duodeals.backend.exception.BadRequestException;
import com.duodeals.backend.exception.ResourceNotFoundException;
import com.duodeals.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DuelService {

    private final DuelRepository duelRepository;
    private final DuelTaskRepository duelTaskRepository;
    private final DuelTaskCompletionRepository duelTaskCompletionRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final AuthService authService;
    private final EmailService emailService;

    @Transactional
    public DuelResponse createDuel(CreateDuelRequest request) {
        User challenger = authService.getAuthenticatedUser();

        // 1. Validate opponent exists
        User opponent = null;
        if (request.getOpponentId() != null) {
            opponent = userRepository.findById(request.getOpponentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Opponent not found with id: " + request.getOpponentId()));
        } else if (request.getOpponentUsernameOrEmail() != null && !request.getOpponentUsernameOrEmail().isBlank()) {
            opponent = userRepository.findByUsernameOrEmail(request.getOpponentUsernameOrEmail(), request.getOpponentUsernameOrEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("Opponent not found: " + request.getOpponentUsernameOrEmail()));
        } else {
            throw new BadRequestException("Opponent ID or username is required");
        }

        if (challenger.getId().equals(opponent.getId())) {
            throw new BadRequestException("You cannot challenge yourself");
        }

        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new BadRequestException("Start date must be before end date");
        }

        // 2. Create Duel entity
        Duel duel = Duel.builder()
                .challenger(challenger)
                .opponent(opponent)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(DuelStatus.PENDING)
                .build();

        duelRepository.save(duel);

        // 3. Create Duel Tasks
        List<DuelTask> tasks = new ArrayList<>();
        for (int i = 0; i < request.getTasks().size(); i++) {
            CreateDuelRequest.DuelTaskRequest taskReq = request.getTasks().get(i);
            DuelTask task = DuelTask.builder()
                    .duel(duel)
                    .taskName(taskReq.getTaskName())
                    .taskTime(taskReq.getTaskTime())
                    .taskOrder(i + 1)
                    .build();
            tasks.add(task);
        }
        duelTaskRepository.saveAll(tasks);

        // 4. Create Notification for Opponent
        Notification notification = Notification.builder()
                .user(opponent)
                .message("⚔️ " + challenger.getUsername() + " challenged you to a habit battle! Check your email to respond.")
                .isRead(false)
                .build();
        notificationRepository.save(notification);

        // 5. Send Email Invitation
        emailService.sendDuelInvitation(opponent.getEmail(), duel, tasks);

        return mapToResponse(duel, tasks);
    }

    @Transactional
    public void acceptDuel(Long duelId) {
        Duel duel = duelRepository.findById(duelId)
                .orElseThrow(() -> new ResourceNotFoundException("Duel not found with id: " + duelId));

        if (duel.getStatus() != DuelStatus.PENDING) {
            throw new BadRequestException("Duel cannot be accepted; current status is: " + duel.getStatus());
        }

        duel.setStatus(DuelStatus.ACTIVE);
        duelRepository.save(duel);

        // Notify challenger
        Notification notification = Notification.builder()
                .user(duel.getChallenger())
                .message("🎉 " + duel.getOpponent().getUsername() + " accepted your duel challenge! Let the battle begin!")
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    @Transactional
    public void rejectDuel(Long duelId) {
        Duel duel = duelRepository.findById(duelId)
                .orElseThrow(() -> new ResourceNotFoundException("Duel not found with id: " + duelId));

        if (duel.getStatus() != DuelStatus.PENDING) {
            throw new BadRequestException("Duel cannot be rejected; current status is: " + duel.getStatus());
        }

        duel.setStatus(DuelStatus.REJECTED);
        duelRepository.save(duel);

        // Notify challenger
        Notification notification = Notification.builder()
                .user(duel.getChallenger())
                .message("❌ " + duel.getOpponent().getUsername() + " declined your duel challenge.")
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<DuelResponse> getMyActiveDuels() {
        User user = authService.getAuthenticatedUser();
        List<Duel> duels = duelRepository.findActiveByUserId(user.getId());

        return duels.stream().map(duel -> {
            List<DuelTask> tasks = duelTaskRepository.findByDuelIdOrderByTaskOrderAsc(duel.getId());
            return mapToResponse(duel, tasks);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DuelResponse> getMyPendingDuels() {
        User user = authService.getAuthenticatedUser();
        List<Duel> duels = duelRepository.findByChallengerIdAndStatusOrOpponentIdAndStatus(
                user.getId(), DuelStatus.PENDING, user.getId(), DuelStatus.PENDING);

        return duels.stream().map(duel -> {
            List<DuelTask> tasks = duelTaskRepository.findByDuelIdOrderByTaskOrderAsc(duel.getId());
            return mapToResponse(duel, tasks);
        }).collect(Collectors.toList());
    }

    @Transactional
    public void toggleDuelTaskComplete(Long duelTaskId, LocalDate date) {
        User user = authService.getAuthenticatedUser();
        DuelTask task = duelTaskRepository.findById(duelTaskId)
                .orElseThrow(() -> new ResourceNotFoundException("Duel task not found with id: " + duelTaskId));

        Duel duel = task.getDuel();
        if (duel.getStatus() != DuelStatus.ACTIVE) {
            throw new BadRequestException("Duel is not active");
        }

        if (!duel.getChallenger().getId().equals(user.getId()) && !duel.getOpponent().getId().equals(user.getId())) {
            throw new BadRequestException("You are not part of this duel");
        }

        if (date.isBefore(duel.getStartDate()) || date.isAfter(duel.getEndDate())) {
            throw new BadRequestException("Completion date is outside the duel range");
        }

        Optional<DuelTaskCompletion> completionOpt = duelTaskCompletionRepository
                .findByDuelTaskIdAndUserIdAndCompletionDate(duelTaskId, user.getId(), date);

        if (completionOpt.isPresent()) {
            DuelTaskCompletion completion = completionOpt.get();
            completion.setIsCompleted(!completion.getIsCompleted());
            
            if (completion.getIsCompleted()) {
                LocalDate today = LocalDate.now();
                if (user.getLastStreakDate() == null || !today.equals(user.getLastStreakDate())) {
                    user.setStreakDays(user.getStreakDays() + 1);
                    user.setLastStreakDate(today);
                }
                
                // Save motivation notification for opponent
                User opponent = duel.getChallenger().getId().equals(user.getId()) ? duel.getOpponent() : duel.getChallenger();
                Notification motivNotification = Notification.builder()
                        .user(opponent)
                        .message("⚔️ " + user.getUsername() + " completed \"" + task.getTaskName() + "\" in your habit battle! Keep pushing! 💪")
                        .isRead(false)
                        .build();
                notificationRepository.save(motivNotification);
            }
            
            // Deduct XP on unchecking, add XP on checking
            int xpReward = completion.getIsCompleted() ? 20 : -20;
            user.setTotalXp(Math.max(0, user.getTotalXp() + xpReward));
            
            duelTaskCompletionRepository.save(completion);
        } else {
            DuelTaskCompletion completion = DuelTaskCompletion.builder()
                    .duelTask(task)
                    .user(user)
                    .completionDate(date)
                    .isCompleted(true)
                    .build();
            
            LocalDate today = LocalDate.now();
            if (user.getLastStreakDate() == null || !today.equals(user.getLastStreakDate())) {
                user.setStreakDays(user.getStreakDays() + 1);
                user.setLastStreakDate(today);
            }
            
            user.setTotalXp(user.getTotalXp() + 20); // Award 20 XP on checking
            duelTaskCompletionRepository.save(completion);

            // Save motivation notification for opponent
            User opponent = duel.getChallenger().getId().equals(user.getId()) ? duel.getOpponent() : duel.getChallenger();
            Notification motivNotification = Notification.builder()
                    .user(opponent)
                    .message("⚔️ " + user.getUsername() + " completed \"" + task.getTaskName() + "\" in your habit battle! Keep pushing! 💪")
                    .isRead(false)
                    .build();
            notificationRepository.save(motivNotification);
        }
    }

    @Transactional(readOnly = true)
    public DuoProgressResponse getDuoProgress(Long duelId) {
        Duel duel = duelRepository.findById(duelId)
                .orElseThrow(() -> new ResourceNotFoundException("Duel not found with id: " + duelId));

        List<DuelTask> tasks = duelTaskRepository.findByDuelIdOrderByTaskOrderAsc(duelId);
        
        User challenger = duel.getChallenger();
        User opponent = duel.getOpponent();

        LocalDate start = duel.getStartDate();
        LocalDate end = duel.getEndDate();
        
        long daysCount = ChronoUnit.DAYS.between(start, end) + 1;

        long totalSlots = tasks.size() * daysCount;

        long challengerDone = duelTaskCompletionRepository.countByDuelTaskDuelIdAndUserIdAndIsCompleted(
                duelId, challenger.getId(), true);
        long opponentDone = duelTaskCompletionRepository.countByDuelTaskDuelIdAndUserIdAndIsCompleted(
                duelId, opponent.getId(), true);

        int challengerRate = totalSlots == 0 ? 0 : (int) Math.round((challengerDone * 100.0) / totalSlots);
        int opponentRate = totalSlots == 0 ? 0 : (int) Math.round((opponentDone * 100.0) / totalSlots);

        java.util.Map<String, java.util.Map<String, java.util.Map<String, Boolean>>> dailyProgress = new java.util.HashMap<>();

        for (int i = 0; i < daysCount; i++) {
            LocalDate date = start.plusDays(i);
            String dateStr = date.toString(); // YYYY-MM-DD

            java.util.Map<String, java.util.Map<String, Boolean>> userCompletions = new java.util.HashMap<>();
            
            java.util.Map<String, Boolean> challengerMap = new java.util.HashMap<>();
            java.util.Map<String, Boolean> opponentMap = new java.util.HashMap<>();

            for (DuelTask t : tasks) {
                // Challenger
                Optional<DuelTaskCompletion> cOpt = duelTaskCompletionRepository
                        .findByDuelTaskIdAndUserIdAndCompletionDate(t.getId(), challenger.getId(), date);
                challengerMap.put(t.getId().toString(), cOpt.isPresent() && cOpt.get().getIsCompleted());

                // Opponent
                Optional<DuelTaskCompletion> oOpt = duelTaskCompletionRepository
                        .findByDuelTaskIdAndUserIdAndCompletionDate(t.getId(), opponent.getId(), date);
                opponentMap.put(t.getId().toString(), oOpt.isPresent() && oOpt.get().getIsCompleted());
            }

            userCompletions.put(challenger.getUsername(), challengerMap);
            userCompletions.put(opponent.getUsername(), opponentMap);

            dailyProgress.put(dateStr, userCompletions);
        }

        return DuoProgressResponse.builder()
                .duelId(duelId)
                .challengerName(challenger.getUsername())
                .opponentName(opponent.getUsername())
                .challengerCompletionRate(challengerRate)
                .opponentCompletionRate(opponentRate)
                .dailyProgress(dailyProgress)
                .build();
    }

    private DuelResponse mapToResponse(Duel duel, List<DuelTask> tasks) {
        List<DuelResponse.DuelTaskDto> taskDtos = tasks.stream().map(t -> 
            DuelResponse.DuelTaskDto.builder()
                    .id(t.getId())
                    .taskName(t.getTaskName())
                    .taskTime(t.getTaskTime())
                    .taskOrder(t.getTaskOrder())
                    .build()
        ).collect(Collectors.toList());

        long totalDays = ChronoUnit.DAYS.between(duel.getStartDate(), duel.getEndDate()) + 1;
        
        LocalDate today = LocalDate.now();
        LocalDate targetLimit = today.plusDays(1);
        if (targetLimit.isAfter(duel.getEndDate().plusDays(1))) {
            targetLimit = duel.getEndDate().plusDays(1);
        }
        if (targetLimit.isBefore(duel.getStartDate())) {
            targetLimit = duel.getStartDate();
        }

        long totalDaysForCalc = ChronoUnit.DAYS.between(duel.getStartDate(), targetLimit);
        long totalSlots = taskDtos.size() * totalDaysForCalc;

        long challengerDone = duelTaskCompletionRepository.countByDuelTaskDuelIdAndUserIdAndIsCompletedAndCompletionDateBefore(
                duel.getId(), duel.getChallenger().getId(), true, targetLimit);
        long opponentDone = duelTaskCompletionRepository.countByDuelTaskDuelIdAndUserIdAndIsCompletedAndCompletionDateBefore(
                duel.getId(), duel.getOpponent().getId(), true, targetLimit);

        int challengerRate = totalSlots == 0 ? 0 : (int) Math.round((challengerDone * 100.0) / totalSlots);
        int opponentRate = totalSlots == 0 ? 0 : (int) Math.round((opponentDone * 100.0) / totalSlots);

        return DuelResponse.builder()
                .id(duel.getId())
                .challengerUsername(duel.getChallenger().getUsername())
                .opponentUsername(duel.getOpponent().getUsername())
                .challengerName(duel.getChallenger().getUsername())
                .opponentName(duel.getOpponent().getUsername())
                .startDate(duel.getStartDate())
                .endDate(duel.getEndDate())
                .status(duel.getStatus())
                .challengerCompletionRate(challengerRate)
                .opponentCompletionRate(opponentRate)
                .tasks(taskDtos)
                .build();
    }
}
