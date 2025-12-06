package com.project_api.dto;

import com.project_api.entity.District;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StateDTO {
    private Long id;

    private String name;


    private List<District> districts;
}
