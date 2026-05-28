package com.duodeals.backend.controller;

import com.duodeals.backend.dto.SoloTaskRequest;
import com.duodeals.backend.dto.SoloTaskResponse;
import com.duodeals.backend.entity.User;
import com.duodeals.backend.exception.ResourceNotFoundException;
import com.duodeals.backend.repository.UserRepository;
import com.duodeals.backend.service.SoloTaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/solo-tasks")
@RequiredArgsConstructor
public class SoloTaskController {

    private final SoloTaskService soloTaskService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<SoloTaskResponse> createSoloTask(
            @Valid @RequestBody SoloTaskRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(soloTaskService.createSoloTask(request, currentUser));
    }

    @GetMapping
    public ResponseEntity<List<SoloTaskResponse>> getSoloTasks(
            @RequestParam(value = "date", required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        LocalDate queryDate = date != null ? date : LocalDate.now();
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(soloTaskService.getTasksByDate(currentUser.getId(), queryDate));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<SoloTaskResponse> toggleComplete(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(soloTaskService.toggleComplete(id, currentUser));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSoloTask(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        soloTaskService.deleteSoloTask(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}
