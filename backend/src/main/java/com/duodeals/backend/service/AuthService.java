package com.duodeals.backend.service;

import com.duodeals.backend.config.JwtService;
import com.duodeals.backend.dto.AuthResponse;
import com.duodeals.backend.dto.LoginRequest;
import com.duodeals.backend.dto.RegisterRequest;
import com.duodeals.backend.entity.User;
import com.duodeals.backend.exception.BadRequestException;
import com.duodeals.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .profilePhotoUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=" + request.getUsername())
                .bio("Duo habits partner!")
                .streakDays(0)
                .totalXp(0)
                .isActive(true)
                .build();

        userRepository.save(user);

        String jwtToken = jwtService.generateToken(user.getUsername());

        return buildAuthResponse(jwtToken, user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsernameOrEmail(request.getUsernameOrEmail(), request.getUsernameOrEmail())
                .orElseThrow(() -> new BadRequestException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid username or password");
        }

        String jwtToken = jwtService.generateToken(user.getUsername());

        return buildAuthResponse(jwtToken, user);
    }

    public User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new BadRequestException("User not authenticated or not found"));
    }

    @Transactional
    public void resetPassword(String usernameOrEmail, String newPassword) {
        User user = userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail)
                .orElseThrow(() -> new BadRequestException("User not found with username or email: " + usernameOrEmail));
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private AuthResponse buildAuthResponse(String token, User user) {
        AuthResponse.UserDetailsDto userDto = AuthResponse.UserDetailsDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .profilePhotoUrl(user.getProfilePhotoUrl())
                .bio(user.getBio())
                .streakDays(user.getStreakDays())
                .totalXp(user.getTotalXp())
                .build();

        return AuthResponse.builder()
                .token(token)
                .user(userDto)
                .build();
    }
}

