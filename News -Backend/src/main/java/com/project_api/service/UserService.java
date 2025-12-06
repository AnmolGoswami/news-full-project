package com.project_api.service;

import com.project_api.dto.LoginRequest;
import com.project_api.dto.RegisterDto;
import com.project_api.dto.UserDTO;
import com.project_api.dto.UserResponseDTO;
import com.project_api.entity.Notification;
import com.project_api.entity.User;
import com.project_api.repo.NotificationRepo;
import com.project_api.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final NotificationRepo notificationRepo;

    private final UserRepo userRepo;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    private String generateUniqueUsername() {
        Random random = new Random();
        String username;
        do {
            username = "User" + (1000 + random.nextInt(9000)); // Generates User1000 to User9999
        } while (userRepo.findByUsername(username).isPresent());
        log.debug("Generated unique username: {}", username);
        return username;
    }

    public String registerUser(RegisterDto registerDto) {
        if (userRepo.findByEmail(registerDto.getEmail()).isPresent()) {
            log.warn("Registration failed: Email {} already used", registerDto.getEmail());
            return "Email Already Used";
        }

        User user = new User();
        user.setEmail(registerDto.getEmail());
        user.setPassword(passwordEncoder.encode(registerDto.getPassword()));
        user.setRole("USER");
        user.setUsername(generateUniqueUsername());
        userRepo.save(user);
        log.info("User registered successfully: {}", registerDto.getEmail());

        return jwtService.generateToken(user);
    }

    public String loginUser(LoginRequest request) {
        try {
            var authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String jwt = jwtService.generateToken(userDetails);
            log.info("User logged in successfully: {}", request.getEmail());
            return jwt;
        } catch (Exception e) {
            log.error("Login failed for email {}: {}", request.getEmail(), e.getMessage());
            throw e;
        }
    }

    public UserDTO getUserByEmail(String email) {
        User user = userRepo.findByEmail(email).orElse(null);
        if (user == null) {
            log.warn("User not found for email: {}", email);
            return null;
        }
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setEmail(user.getEmail());
        userDTO.setUsername(user.getDisplayUsername());
        log.debug("Fetched user details for email: {}", email);
        return userDTO;
    }






    public void suspendUser(Long id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setEnabled(false);
        userRepo.save(user);

        notifyUser(user.getEmail(), "Your account has been suspended by admin.");
    }


    public void activateUser(Long id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setEnabled(true);
        userRepo.save(user);

        notifyUser(user.getEmail(), "Your account has been reactivated by admin.");
    }


    private UserResponseDTO mapToDTO(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getDisplayUsername()); // or user.getUsername()
        dto.setEmail(user.getEmail());
        dto.setEnabled(user.isEnabled());
        return dto;
    }


    public List<UserResponseDTO> getUsersByRole(String role) {
        return userRepo.findByRole(role)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }



    private void notifyUser(String email, String message) {
        Notification n = new Notification();
        n.setType("ACCOUNT_STATUS");
        n.setMessage(message);
        n.setEmail(email);
        n.setSeen(false);
        n.setCreatedAt(LocalDateTime.now());
        notificationRepo.save(n);
    }

}