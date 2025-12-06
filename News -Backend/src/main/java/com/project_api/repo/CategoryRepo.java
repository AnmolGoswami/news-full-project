package com.project_api.repo;

import com.project_api.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoryRepo extends JpaRepository<Category,Long> {

    @Override
    long count();
    Optional<Category> findByName(String name);
}
