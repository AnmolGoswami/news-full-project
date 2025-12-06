package com.project_api.repo;

import com.project_api.entity.Language;
import com.project_api.entity.News;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

public interface LanguageRepo extends JpaRepository<Language , Long> {

    @Override
    long count();



    Optional<Language> findByName(String name);

}
