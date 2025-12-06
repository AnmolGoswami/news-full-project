package com.project_api.controller;

import com.project_api.dto.AdminNotificationRequest;
import com.project_api.dto.ContactDto;
import com.project_api.dto.UserResponseDTO;
import com.project_api.entity.Contact;
import com.project_api.entity.Notification;
import com.project_api.entity.User;
import com.project_api.repo.ContactRepo;
import com.project_api.repo.NotificationRepo;
import com.project_api.repo.UserRepo;
import com.project_api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminUserControllers {

    private final UserService userService;

    private final ContactRepo contactRepo;
    private final UserRepo userRepo;

    private final NotificationRepo notificationRepo;

    @GetMapping("/users")
    public ResponseEntity<List<UserResponseDTO>> getAllUserRoleUsers(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.getUsersByRole("USER"));
    }

    @PutMapping("/users/{id}/suspend")
    public ResponseEntity<String> suspendUser(@AuthenticationPrincipal User user,@PathVariable Long id) {
        userService.suspendUser(id);
        return ResponseEntity.ok("User suspended");
    }

    @PutMapping("/users/{id}/activate")
    public ResponseEntity<String> activateUser(@AuthenticationPrincipal User user,@PathVariable Long id) {
        userService.activateUser(id);
        return ResponseEntity.ok("User activated");
    }

    @PostMapping("/users/send-notification")
    public ResponseEntity<String> sendNotificationToUser(@AuthenticationPrincipal User user,@RequestBody AdminNotificationRequest request) {
        Optional<User> optionalUser = userRepo.findByEmail(request.getEmail());

        if (optionalUser.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found with email: " + request.getEmail());
        }

        Notification notification = new Notification();
        notification.setEmail(request.getEmail());
        notification.setMessage(request.getMessage());
        notification.setType(request.getType() != null ? request.getType() : "INFO");
        notification.setSeen(false);
        notification.setCreatedAt(LocalDateTime.now());

        notificationRepo.save(notification);

        return ResponseEntity.ok("Notification sent to user " + request.getEmail());
    }

    @PostMapping("/contact")
    public ResponseEntity<String> getConnect(@AuthenticationPrincipal User user,@RequestBody ContactDto dto){
        Contact contact = new Contact();
        contact.setName(dto.getName());
        contact.setEmail(dto.getEmail());
        contact.setCompany(dto.getCompany());
        contact.setMessage(dto.getMessage());
        contact.setCreatedAt(LocalDateTime.now());
        contactRepo.save(contact);

        Notification notification = new Notification();
        notification.setType("CONTACT_MESSAGE");
        notification.setMessage("New contact from " + dto.getName() + " (" + dto.getEmail() + ")");
        notification.setCreatedAt(LocalDateTime.now());
        notificationRepo.save(notification);

        return new ResponseEntity<>("Thanks for Connecting Us", HttpStatus.OK);

    }

    @GetMapping("/get/contacts")
    public ResponseEntity<List<ContactDto>> getAllContacts(@AuthenticationPrincipal User user) {
        List<ContactDto> dtos = contactRepo.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/delete/contacts")
    public ResponseEntity<String> deleteAllContacts(@AuthenticationPrincipal User user) {
        contactRepo.deleteAll();
        return ResponseEntity.ok("All contact messages have been deleted.");
    }




    private ContactDto mapToDto(Contact contact) {
        return new ContactDto(
                contact.getName(),
                contact.getEmail(),

                contact.getMessage(),
                contact.getCompany()

        );
    }

}
