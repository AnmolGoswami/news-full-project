package com.project_api.dto;

import lombok.Data;

@Data
public class AdminNotificationRequest {
    private String email;       // required to target the user
    private String message;     // custom message
    private String type;
}
