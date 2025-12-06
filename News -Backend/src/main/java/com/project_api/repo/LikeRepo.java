package com.project_api.repo;

import com.project_api.entity.Like;
import com.project_api.entity.News;
import com.project_api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LikeRepo extends JpaRepository<Like,Long> {

    boolean existsByUserAndNews(User user, News news);
    long countByNews(News news);
}
