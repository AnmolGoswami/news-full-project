package com.project_api.repo;

import com.project_api.entity.News;
import com.project_api.entity.State;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StateRepo extends JpaRepository<State,Long> {

    @Override
    long count();
    Optional<State> findByName(String name);

}
