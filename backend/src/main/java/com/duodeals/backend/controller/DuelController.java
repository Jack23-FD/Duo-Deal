package com.duodeals.backend.controller;

import com.duodeals.backend.dto.CreateDuelRequest;
import com.duodeals.backend.dto.DuelResponse;
import java.util.Map;
import com.duodeals.backend.dto.DuoProgressResponse;
import com.duodeals.backend.service.DuelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/duels")
@RequiredArgsConstructor
public class DuelController {

    private final DuelService duelService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @PostMapping
    public ResponseEntity<DuelResponse> createDuel(@Valid @RequestBody CreateDuelRequest request) {
        return ResponseEntity.ok(duelService.createDuel(request));
    }

    // Direct HTTP Accept Link (Handles both /api/duels/{id}/accept and /api/duels/accept/{id})
    @GetMapping({"/{id}/accept", "/accept/{id}"})
    public ResponseEntity<Void> acceptDuel(@PathVariable("id") Long id) {
        duelService.acceptDuel(id);
        String redirectUrl = frontendUrl + "/challenges?status=accepted";
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(redirectUrl))
                .build();
    }

    // Direct HTTP Reject Link (Handles both /api/duels/{id}/reject and /api/duels/reject/{id})
    @GetMapping({"/{id}/reject", "/reject/{id}"})
    public ResponseEntity<Void> rejectDuel(@PathVariable("id") Long id) {
        duelService.rejectDuel(id);
        String redirectUrl = frontendUrl + "/challenges?status=rejected";
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(redirectUrl))
                .build();
    }

    @GetMapping("/my")
    public ResponseEntity<List<DuelResponse>> getMyActiveDuels() {
        return ResponseEntity.ok(duelService.getMyActiveDuels());
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingDuels() {
        try {
            java.util.List<com.duodeals.backend.dto.DuelResponse> duels = duelService.getMyPendingDuels();
            return ResponseEntity.ok(java.util.Map.of("count", duels.size(), "duels", duels));
        } catch (Exception e) {
            // Fallback to empty list on any error
            return ResponseEntity.ok(java.util.Map.of("count", 0, "duels", java.util.Collections.emptyList()));
        }
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<Void> acceptDuelPost(@PathVariable("id") Long id) {
        duelService.acceptDuel(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<Void> rejectDuelPost(@PathVariable("id") Long id) {
        duelService.rejectDuel(id);
        return ResponseEntity.ok().build();
    }

    // Complete a duel task
    @PatchMapping("/tasks/{id}/complete")
    public ResponseEntity<Void> toggleDuelTaskComplete(
            @PathVariable("id") Long id,
            @RequestParam(value = "date", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        LocalDate queryDate = date != null ? date : LocalDate.now();
        duelService.toggleDuelTaskComplete(id, queryDate);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/progress")
    public ResponseEntity<DuoProgressResponse> getDuoProgress(@PathVariable("id") Long id) {
        return ResponseEntity.ok(duelService.getDuoProgress(id));
    }
}
