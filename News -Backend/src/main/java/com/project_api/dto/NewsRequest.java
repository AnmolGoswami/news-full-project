package com.project_api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NewsRequest {
    private String title;
    private String content;
    private String state; // Changed from State to String
    private String district; // Changed from District to String
    private String category; // Changed from Category to String
    private String language;
    private LocalDateTime publishDate;
    private String videoLink;
}