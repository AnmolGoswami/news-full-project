package com.project_api.dto;

import com.project_api.entity.Category;
import com.project_api.entity.District;
import com.project_api.entity.Language;
import com.project_api.entity.State;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NewsResponse {
    private Long id;
    private String title;
    private String content;
    private State state;
    private District district;
    private Category category;
    private Language language;
    private LocalDateTime publishedData;
    private String videoLink;
    private String imageUrl;
}
