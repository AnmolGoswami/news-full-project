package com.project_api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NewsDTO {
    private Long id;
    private String title;
    private String content;
    private String stateName; // State.name
    private String districtName; // District.name
    private String categoryName; // Category.name
    private String language;
    private LocalDateTime publishedDate;
    private String videoLink;
    private String imageUrl;
    private Long viewCount;
    private Long shareCount;
    private String createdBy;

}
