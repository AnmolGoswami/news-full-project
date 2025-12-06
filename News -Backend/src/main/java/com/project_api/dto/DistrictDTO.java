package com.project_api.dto;

import com.project_api.entity.State;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class DistrictDTO {
    private Long id;

    private String name;



    private Long stateId;
}
