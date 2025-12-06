package com.project_api.repo;

import com.project_api.entity.Category;
import com.project_api.entity.News;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface NewsRepo extends JpaRepository<News,Long> {

    @Override
    long count();

    List<News> findTop5ByOrderByPublishedDateDesc();  // Top 5 latest news

    // Optional: for top 10
    List<News> findTop10ByOrderByPublishedDateDesc();


    List<News> findTop10ByOrderByViewCountDesc();


    List<News> findByCategory_NameIgnoreCase(String categoryName);

    List<News> findTop10ByOrderByShareCountDesc();

    List<News> findTop5ByCategoryAndIdNotOrderByPublishedDateDesc(Category category, Long id);

    List<News> findByState_NameIgnoreCase(String stateName);
    List<News> findByDistrict_NameIgnoreCase(String districtName);

    List<News> findByLanguage_NameIgnoreCase(String languageName);

    List<News> findByPublishedDateBetween(LocalDateTime from, LocalDateTime to);

}
