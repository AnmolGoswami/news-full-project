package com.project_api.repo;

import com.project_api.entity.District;
import com.project_api.entity.State;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DistrictRepo extends JpaRepository<District,Long> {

    @Override
    long count();
    Optional<District> findByName(String name);

    Optional<District> findByNameAndState(String name, State state);
}
