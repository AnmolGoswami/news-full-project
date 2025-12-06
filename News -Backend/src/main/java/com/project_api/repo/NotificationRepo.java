package com.project_api.repo;

import com.project_api.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface NotificationRepo extends JpaRepository<Notification, Long> {
        List<Notification> findBySeenFalse();
        List<Notification> findBySeenFalseOrderByCreatedAtDesc();

        Optional<Notification> findByCommentId(Long commentId);
        List<Notification> findByEmailAndSeenFalseOrderByCreatedAtDesc(String email);
        List<Notification> findByEmail(String email);
}