package com.duodeals.backend.service;

import com.duodeals.backend.dto.SoloTaskRequest;
import com.duodeals.backend.dto.SoloTaskResponse;
import com.duodeals.backend.entity.SoloTask;
import com.duodeals.backend.entity.User;
import com.duodeals.backend.exception.BadRequestException;
import com.duodeals.backend.exception.ResourceNotFoundException;
import com.duodeals.backend.repository.SoloTaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SoloTaskService {

    private final SoloTaskRepository soloTaskRepository;

    @Transactional
    public SoloTaskResponse createSoloTask(SoloTaskRequest request, User user) {
        SoloTask soloTask = SoloTask.builder()
                .user(user)
                .taskName(request.getTaskName())
                .taskTime(request.getTaskTime())
                .taskDate(request.getTaskDate())
                .isCompleted(false)
                .build();

        soloTaskRepository.save(soloTask);
        return mapToResponse(soloTask);
    }

    @Transactional(readOnly = true)
    public List<SoloTaskResponse> getTasksByDate(Long userId, LocalDate date) {
        List<SoloTask> tasks = soloTaskRepository.findByUserIdAndTaskDate(userId, date);
        return tasks.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public SoloTaskResponse toggleComplete(Long taskId, User user) {
        SoloTask soloTask = soloTaskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Solo task not found with id: " + taskId));

        if (!soloTask.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You are not authorized to edit this task");
        }

        soloTask.setIsCompleted(!soloTask.getIsCompleted());
        
        if (soloTask.getIsCompleted()) {
            LocalDate today = LocalDate.now();
            if (user.getLastStreakDate() == null || !today.equals(user.getLastStreakDate())) {
                user.setStreakDays(user.getStreakDays() + 1);
                user.setLastStreakDate(today);
            }
        }
        
        // Dynamic XP logic: Add 10 XP on completion, deduct 10 XP on unchecking
        int xpReward = soloTask.getIsCompleted() ? 10 : -10;
        user.setTotalXp(Math.max(0, user.getTotalXp() + xpReward));
        
        soloTaskRepository.save(soloTask);
        return mapToResponse(soloTask);
    }

    @Transactional
    public void deleteSoloTask(Long taskId, User user) {
        SoloTask soloTask = soloTaskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Solo task not found with id: " + taskId));

        if (!soloTask.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You are not authorized to delete this task");
        }

        soloTaskRepository.delete(soloTask);
    }

    private SoloTaskResponse mapToResponse(SoloTask task) {
        return SoloTaskResponse.builder()
                .id(task.getId())
                .taskName(task.getTaskName())
                .taskTime(task.getTaskTime())
                .taskDate(task.getTaskDate())
                .isCompleted(task.getIsCompleted())
                .build();
    }
}
