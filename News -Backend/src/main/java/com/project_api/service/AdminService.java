package com.project_api.service;

import com.project_api.dto.LoginRequest;
import com.project_api.entity.User;
import com.project_api.repo.UserRepo;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdminService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;
    @Autowired
    private UserRepo adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${admin.default.email}")
    private String defaultEmail;

    @Value("${admin.default.password}")
    private String defaultPassword;

    @PostConstruct
    public void initAdmin() {
        try {
            if (adminRepository.count() == 0) {
                User admin = new User();
                admin.setEmail(defaultEmail);
                admin.setPassword(passwordEncoder.encode(defaultPassword));
                admin.setRole("ADMIN");
                admin.setEnabled(true);

                // ✅ Fix here
                admin.setUsername("SuperAdmin"); // Or any default username

                adminRepository.save(admin);
                System.out.println("Default admin created with email: " + defaultEmail);
            }
        } catch (Exception e) {
            System.err.println("Error initializing default admin: " + e.getMessage());
            e.printStackTrace();
        }
    }



    public boolean changePassword(String email, String oldPassword, String newPassword) {
        User admin = adminRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found"));
        if (passwordEncoder.matches(oldPassword, admin.getPassword())) {
            admin.setPassword(passwordEncoder.encode(newPassword));
            adminRepository.save(admin);
            return true;
        }
        return false;
    }



    public String loginUser(LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                loginRequest.getEmail(),loginRequest.getPassword()
        ));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetails userDetails =(UserDetails) authentication.getPrincipal();
        String jwt = jwtService.generateToken(userDetails);



        return jwt;
    }
}
