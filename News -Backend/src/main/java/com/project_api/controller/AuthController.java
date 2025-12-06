package com.project_api.controller;

import com.project_api.dto.ChangePasswordRequest;
import com.project_api.dto.JwtResponse;
import com.project_api.dto.LoginRequest;
import com.project_api.dto.RegisterDto;
import com.project_api.entity.User;
import com.project_api.service.AdminService;
import com.project_api.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AuthController {
    @Autowired
    private AdminService adminService;
    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> loginRequest(@RequestBody LoginRequest loginRequest){
        String jwt = adminService.loginUser(loginRequest);

        return  new ResponseEntity<>(new JwtResponse(jwt,"Thanks For Login"), HttpStatus.ACCEPTED);
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword( @AuthenticationPrincipal User user,@RequestBody ChangePasswordRequest request) {
        String email = user.getEmail();
        boolean success = adminService.changePassword(email, request.getOldPassword(), request.getNewPassword());
        if (success) {
            return ResponseEntity.ok("Password changed successfully");
        }
        return ResponseEntity.badRequest().body("Incorrect old password");
    }




    @PostMapping("/user/register")
    public ResponseEntity<JwtResponse> registerUser(@RequestBody RegisterDto registerDto) {
        String jwt = userService.registerUser(registerDto);
        return new ResponseEntity<>(new JwtResponse(jwt,"Register Success"), HttpStatus.CREATED);

    }

    @PostMapping("/user/loginUser")
    public ResponseEntity<JwtResponse> loginUserRequest(@RequestBody LoginRequest loginRequest){
        String jwt = userService.loginUser(loginRequest);
        return new ResponseEntity<>(new JwtResponse(jwt,"Login Success"),HttpStatus.OK);
    }
}
