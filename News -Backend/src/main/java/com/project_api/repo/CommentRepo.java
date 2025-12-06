package com.project_api.repo;

import com.project_api.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepo extends JpaRepository<Comment,Long> {

    List<Comment> findByNewsId(Long newsId);
}
