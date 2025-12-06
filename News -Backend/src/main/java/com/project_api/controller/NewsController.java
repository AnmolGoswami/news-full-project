package com.project_api.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.project_api.dto.*;
import com.project_api.entity.*;
import com.project_api.repo.*;
import com.project_api.service.NewsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class NewsController {

    private final NewsService newsService;
    private final SimpMessagingTemplate messagingTemplate;
    private final LikeRepo likeRepo;
    private final CommentRepo commentRepo;
    private final NewsRepo newsRepo;
    private final NotificationRepo notificationRepo;
    private final UserRepo userRepo;

    @PostMapping("/admin/addNews")
    public ResponseEntity<Response> addNews(@AuthenticationPrincipal User user, @RequestPart("news") String news,
                                            @RequestPart("file") MultipartFile file) {
        if (user == null || !"ADMIN".equals(user.getRole())) {
            log.error("Unauthorized access attempt to addNews by user {}", user != null ? user.getEmail() : "null");
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin privileges required");
        }
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        NewsRequest request;
        try {
            request = objectMapper.readValue(news, NewsRequest.class);
        } catch (JsonProcessingException e) {
            log.error("Invalid news data: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid news data: " + e.getMessage());
        }

        News createdNews = newsService.addNews(request, file,user.getUsername());
        if (createdNews == null || createdNews.getId() == null) {
            log.error("Failed to create news: NewsService returned null or invalid news");
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to create news");
        }

        List<User> allUsers = userRepo.findAll();
        String title = createdNews.getTitle() != null ? createdNews.getTitle() : "Untitled News";
        String adminUsername = user.getDisplayUsername() != null ? user.getDisplayUsername() : "Admin";
        List<Notification> notifications = allUsers.stream()
                .filter(u -> !u.getEmail().equals(user.getEmail()))
                .map(targetUser -> {
                    Notification notification = new Notification();
                    notification.setType("NEWS_CREATED");
                    notification.setMessage("New news published: \"" + title + "\" by " + adminUsername);
                    notification.setNewsId(createdNews.getId());
                    notification.setSeen(false);
                    notification.setEmail(targetUser.getEmail());
                    notification.setCreatedAt(LocalDateTime.now());
                    return notification;
                })
                .collect(Collectors.toList());
        notificationRepo.saveAll(notifications);
        notifications.forEach(n -> {
            User targetUser = userRepo.findByEmail(n.getEmail()).orElse(null);
            if (targetUser != null) {
                NotificationResponse response = mapToNotificationResponse(n, targetUser);
                messagingTemplate.convertAndSend("/topic/notifications/" + targetUser.getId(), response);
                log.info("Sent WebSocket notification for new news ID {} to user {}", createdNews.getId(), n.getEmail());
            }
        });

        return new ResponseEntity<>(new Response("News created successfully"), HttpStatus.OK);
    }

    @PutMapping("/admin/updateNews/{id}")
    public ResponseEntity<Response> updateNews(@AuthenticationPrincipal User user, @PathVariable Long id,
                                               @RequestPart("news") String news, @RequestPart("file") MultipartFile file) {
        if (user == null || !"ADMIN".equals(user.getRole())) {
            log.error("Unauthorized access attempt to updateNews by user {}", user != null ? user.getEmail() : "null");
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin privileges required");
        }
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        NewsRequest request;
        try {
            request = objectMapper.readValue(news, NewsRequest.class);
        } catch (JsonProcessingException e) {
            log.error("Invalid news data: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid news data: " + e.getMessage());
        }

        News updatedNews = newsService.updateNews(id, request, file,user.getUsername());
        if (updatedNews == null || updatedNews.getId() == null) {
            log.error("Failed to update news ID {}: NewsService returned null or invalid news", id);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "News not found");
        }

        List<User> allUsers = userRepo.findAll();
        String title = updatedNews.getTitle() != null ? updatedNews.getTitle() : "Untitled News";
        String adminUsername = user.getDisplayUsername() != null ? user.getDisplayUsername() : "Admin";
        List<Notification> notifications = allUsers.stream()
                .filter(u -> !u.getEmail().equals(user.getEmail()))
                .map(targetUser -> {
                    Notification notification = new Notification();
                    notification.setType("NEWS_UPDATED");
                    notification.setMessage("News updated: \"" + title + "\" by " + adminUsername);
                    notification.setNewsId(id);
                    notification.setSeen(false);
                    notification.setEmail(targetUser.getEmail());
                    notification.setCreatedAt(LocalDateTime.now());
                    return notification;
                })
                .collect(Collectors.toList());
        notificationRepo.saveAll(notifications);
        notifications.forEach(n -> {
            User targetUser = userRepo.findByEmail(n.getEmail()).orElse(null);
            if (targetUser != null) {
                NotificationResponse response = mapToNotificationResponse(n, targetUser);
                messagingTemplate.convertAndSend("/topic/notifications/" + targetUser.getId(), response);
                log.info("Sent WebSocket notification for updated news ID {} to user {}", id, n.getEmail());
            }
        });

        return new ResponseEntity<>(new Response("News updated successfully"), HttpStatus.OK);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        try {
            return new ResponseEntity<>(newsService.getDashboardStats(), HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error fetching stats: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching stats");
        }
    }

    @GetMapping("/news")
    public ResponseEntity<List<NewsDTO>> getAllNews() {
        try {
            return new ResponseEntity<>(newsService.getAllNews(), HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error fetching all news: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching news");
        }
    }

    @GetMapping("/latest5")
    public ResponseEntity<List<NewsDTO>> getLatest5News() {
        try {
            return new ResponseEntity<>(newsService.getTop5News(), HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error fetching top 5 news: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching top 5 news");
        }
    }

    @GetMapping("/latest10")
    public ResponseEntity<List<NewsDTO>> getLatest10News() {
        try {
            return new ResponseEntity<>(newsService.getTop10News(), HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error fetching top 10 news: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching top 10 news");
        }
    }

    @GetMapping("/getCategories")
    public ResponseEntity<List<CategoriesDTO>> getCategories() {
        try {
            return new ResponseEntity<>(newsService.getCategory(), HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error fetching categories: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching categories");
        }
    }

    @GetMapping("/getState")
    public ResponseEntity<List<StateDTO>> getStates() {
        try {
            return new ResponseEntity<>(newsService.getState(), HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error fetching states: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching states");
        }
    }

    @GetMapping("/getDistricts")
    public ResponseEntity<List<DistrictDTO>> getDistricts() {
        try {
            return new ResponseEntity<>(newsService.getDistrict(), HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error fetching districts: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching districts");
        }
    }

    @GetMapping("/getLanguage")
    public ResponseEntity<List<LanguageDTO>> getLanguage(){
        try {
            return new ResponseEntity<>(newsService.getLanguage(),HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error  fetching language {}",e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,"Error fetching language");
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteNewsById(@AuthenticationPrincipal User user, @PathVariable Long id) {
        if (user == null || !"ADMIN".equals(user.getRole())) {
            log.error("Unauthorized access attempt to delete news ID {} by user {}", id, user != null ? user.getEmail() : "null");
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin privileges required");
        }

        try {
            newsService.deleteNews(id);
            return ResponseEntity.ok().build();
        } catch (ResponseStatusException e) {
            // Only log and rethrow what was already thrown in the service
            log.error("Error deleting news ID {}: {}", id, e.getMessage());
            throw e; // Don't change status code here
        } catch (Exception e) {
            // For unexpected errors
            log.error("Unexpected error deleting news ID {}: {}", id, e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to delete news");
        }
    }


    @GetMapping("/trending")
    public ResponseEntity<List<NewsDTO>> getTrendingNews() {
        try {
            return new ResponseEntity<>(newsService.getTrendingNews(), HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error fetching trending news: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching trending news");
        }
    }

    @GetMapping("/newsByCategory")
    public ResponseEntity<List<NewsDTO>> getNewsByCategory(@RequestParam String category) {
        try {
            return new ResponseEntity<>(newsService.getNewsByCategory(category), HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error fetching news by category {}: {}", category, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching news by category");
        }
    }

    @GetMapping("/newsByLanguage")
    public ResponseEntity<List<NewsDTO>> getNewsBylanguage(@RequestParam String language){
        try{
            return new ResponseEntity<>(newsService.getNewsByLanguage(language),HttpStatus.OK);
        }catch (Exception e){
            log.error("Error fetching news by language {}:{}",language , e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,"Error fetching news by language");
        }
    }

    @GetMapping("/newsByState")
    public ResponseEntity<List<NewsDTO>> getNewsByState(@RequestParam String state) {
        try {
            return new ResponseEntity<>(newsService.getNewsByState(state), HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error fetching news by state {}: {}", state, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching news by state");
        }
    }



    @GetMapping("/newsByDistrict")
    public ResponseEntity<List<NewsDTO>> getNewsByDistrict(@RequestParam String district) {
        try {
            return new ResponseEntity<>(newsService.getNewsByDistrict(district), HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error fetching news by district {}: {}", district, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching news by district");
        }
    }

    @GetMapping("/news/{id}")
    public ResponseEntity<NewsDTO> getNewsDetails(@PathVariable Long id) {
        try {
            NewsDTO news = newsService.getNewsById(id);
            if (news == null) {
                log.warn("News not found for ID {}", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
            return ResponseEntity.ok(news);
        } catch (Exception e) {
            log.error("Error fetching news with ID {}: {}", id, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching news: " + e.getMessage());
        }
    }

    @PostMapping("/news/{id}/view")
    public ResponseEntity<String> trackView(@PathVariable Long id) {

        try {
            newsService.incrementViewCount(id);
            return ResponseEntity.ok("View counted");
        } catch (Exception e) {
            log.error("Error tracking view for news ID {}: {}", id, e.getMessage());
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "News not found");
        }
    }

    @PostMapping("/news/{id}/share")
    public ResponseEntity<String> trackShare(@PathVariable Long id) {

        try {
            newsService.incrementShareCount(id);
            return ResponseEntity.ok("Share counted");
        } catch (Exception e) {
            log.error("Error tracking share for news ID {}: {}", id, e.getMessage());
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "News not found");
        }
    }

    @GetMapping("/news/related/{id}")
    public ResponseEntity<List<NewsDTO>> getRelatedNews(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(newsService.getRelatedNews(id));
        } catch (Exception e) {
            log.error("Error fetching related news for ID {}: {}", id, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching related news: " + e.getMessage());
        }
    }

    @PostMapping("/news/{newsId}/like")
    public ResponseEntity<String> likeNews(@AuthenticationPrincipal User user, @PathVariable Long newsId) {
        if (user == null) {
            log.error("Unauthorized access attempt to like news ID {}", newsId);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized: Please log in.");
        }
        News news = newsRepo.findById(newsId).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "News not found"));
        if (likeRepo.existsByUserAndNews(user, news)) {
            log.warn("User {} already liked news ID {}", user.getEmail(), newsId);
            return ResponseEntity.badRequest().body("Already liked this article");
        }
        Like like = new Like();
        like.setUser(user);
        like.setNews(news);
        likeRepo.save(like);

        String title = news.getTitle() != null ? news.getTitle() : "Untitled Article";
        String username = user.getDisplayUsername() != null ? user.getDisplayUsername() : "Guest";
        Notification n = new Notification();
        n.setType("LIKE");
        n.setMessage("New like on \"" + title + "\" by " + username);
        n.setNewsId(newsId);
        n.setSeen(false);
        n.setEmail(news.getCreatedBy());
        n.setCreatedAt(LocalDateTime.now());
        notificationRepo.save(n);
        User targetUser = userRepo.findByEmail(news.getCreatedBy()).orElse(null);
        if (targetUser != null) {
            NotificationResponse response = mapToNotificationResponse(n, targetUser);
            messagingTemplate.convertAndSend("/topic/notifications/" + targetUser.getId(), response);
            log.info("Sent WebSocket notification for like on news ID {} to user {}", newsId, news.getCreatedBy());
        }

        return ResponseEntity.ok("Article liked");
    }

    @PostMapping("/news/{newsId}/comments")
    public ResponseEntity<CommentResponse> commentNews(@PathVariable Long newsId,
                                                       @AuthenticationPrincipal User user,
                                                       @RequestBody CommentRequest commentRequest) {
        if (user == null) {
            log.error("Unauthorized access attempt to comment on news ID {}", newsId);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized: Please log in to comment.");
        }
        News news = newsRepo.findById(newsId).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "News not found"));
        if (commentRequest.getContent() == null || commentRequest.getContent().trim().isEmpty()) {
            log.warn("Empty comment content for news ID {} by user {}", newsId, user.getEmail());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment content cannot be empty");
        }
        Comment comment = new Comment();
        comment.setUser(user);
        comment.setNews(news);
        comment.setContent(commentRequest.getContent());
        comment.setUsername(user.getDisplayUsername() != null ? user.getDisplayUsername() : "Guest");
        comment.setCreatedAt(LocalDateTime.now());
        commentRepo.save(comment);

        String title = news.getTitle() != null ? news.getTitle() : "Untitled Article";
        Notification n = new Notification();
        n.setType("COMMENT");
        n.setMessage("New comment on \"" + title + "\" by " + comment.getUsername());
        n.setNewsId(newsId);
        n.setCommentId(comment.getId());
        n.setSeen(false);
        n.setEmail(news.getCreatedBy());
        n.setCreatedAt(LocalDateTime.now());
        notificationRepo.save(n);
        User targetUser = userRepo.findByEmail(news.getCreatedBy()).orElse(null);
        if (targetUser != null) {
            NotificationResponse response = mapToNotificationResponse(n, targetUser);
            messagingTemplate.convertAndSend("/topic/notifications/" + targetUser.getId(), response);
            log.info("Sent WebSocket notification for comment on news ID {} to user {}", newsId, news.getCreatedBy());
        }

        return ResponseEntity.ok(new CommentResponse(
                comment.getContent(),
                comment.getUsername(),
                user.getEmail(),
                comment.getCreatedAt().toString()
        ));
    }

    @GetMapping("/{newsId}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long newsId) {
        try {
            List<Comment> comments = commentRepo.findByNewsId(newsId);
            List<CommentResponse> response = comments.stream()
                    .map(comment -> new CommentResponse(
                            comment.getContent(),
                            comment.getUsername() != null ? comment.getUsername() : "Guest",
                            comment.getUser() != null ? comment.getUser().getEmail() : "guest@example.com",
                            comment.getCreatedAt().toString()
                    ))
                    .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching comments for news ID {}: {}", newsId, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching comments");
        }
    }

    @GetMapping("/news/{newsId}/likes/count")
    public ResponseEntity<Long> getLikeCount(@PathVariable Long newsId) {
        try {
            News news = newsRepo.findById(newsId).orElseThrow(() ->
                    new ResponseStatusException(HttpStatus.NOT_FOUND, "News not found"));
            return ResponseEntity.ok(likeRepo.countByNews(news));
        } catch (Exception e) {
            log.error("Error fetching like count for news ID {}: {}", newsId, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching like count");
        }
    }
    @GetMapping("/comments/{commentId}")
    public ResponseEntity<CommentResponse> getCommentById(@PathVariable Long commentId) {
        Comment comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));

        CommentResponse response = new CommentResponse(
                comment.getContent(),
                comment.getUsername(),   // directly stored in Comment entity
                null,                    // email is not available
                comment.getCreatedAt().toString()
        );

        return ResponseEntity.ok(response);
    }


    @DeleteMapping("/news/comments/{commentId}")
    public ResponseEntity<String> deleteComment(@AuthenticationPrincipal User user, @PathVariable Long commentId) {
        if (user == null) {
            log.error("Unauthorized access attempt to delete comment ID {}", commentId);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized: Please log in.");
        }
        Comment comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));
        if (!comment.getUser().getEmail().equals(user.getEmail())) {
            log.error("User {} not authorized to delete comment ID {}", user.getEmail(), commentId);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to delete this comment");
        }
        commentRepo.deleteById(commentId);
        Notification notification = notificationRepo.findByCommentId(commentId).orElse(null);
        if (notification != null) {
            User targetUser = userRepo.findByEmail(notification.getEmail()).orElse(null);
            if (targetUser != null) {
                NotificationResponse response = mapToNotificationResponse(notification, targetUser);
                notificationRepo.delete(notification);
                messagingTemplate.convertAndSend("/topic/notifications/deleted", response);
                log.info("Deleted notification ID {} for comment ID {}", notification.getId(), commentId);
            }
        }
        log.info("Deleted comment ID {} by user {}", commentId, user.getEmail());
        return ResponseEntity.ok("Comment deleted");
    }

    @GetMapping("/news/notifications")
    public ResponseEntity<List<NotificationResponse>> getNotifications(@AuthenticationPrincipal User user) {
        if (user == null) {
            log.error("Unauthorized access attempt to fetch notifications");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized: Please log in.");
        }
        try {
            List<Notification> notifications = notificationRepo.findAll();
            List<NotificationResponse> response = notifications.stream()
                    .map(n -> {
                        User notificationUser = userRepo.findByEmail(n.getEmail()).orElse(null);
                        return new NotificationResponse(
                                n.getId(),
                                n.getType(),
                                n.getMessage(),
                                n.getNewsId(),
                                n.isSeen(),
                                n.getEmail(),
                                n.getCreatedAt().toString(),
                                n.getCommentId(),
                                notificationUser != null ? notificationUser.getDisplayUsername() : "Unknown"
                        );
                    })
                    .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                    .collect(Collectors.toList());
            log.info("Fetched {} notifications for user {}", response.size(), user.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching notifications for user {}: {}", user.getEmail(), e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching notifications");
        }
    }

    @GetMapping("/auth/user")
    public ResponseEntity<UserResponse> getUserDetails(@AuthenticationPrincipal User user) {
        if (user == null) {
            log.error("Unauthorized access attempt to fetch user details");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized: Please log in.");
        }
        try {
            UserResponse response = new UserResponse(
                    user.getId(),
                    user.getEmail(),
                    user.getDisplayUsername(),
                    user.getRole()
            );
            log.info("Fetched user details for {}", user.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching user details for {}: {}", user.getEmail(), e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching user details");
        }
    }

    @PostMapping("/news/notifications/{id}/mark-seen")
    @Transactional
    public ResponseEntity<String> markSeen(@AuthenticationPrincipal User user, @PathVariable Long id) {
        if (user == null) {
            log.error("Unauthorized access attempt to mark notification ID {} as seen", id);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized: Please log in.");
        }
        try {
            Notification n = notificationRepo.findById(id).orElseThrow(() ->
                    new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));

            n.setSeen(true);
            notificationRepo.save(n);
            NotificationResponse response = mapToNotificationResponse(n, user);
            messagingTemplate.convertAndSend("/topic/notifications/" + user.getId(), response);
            log.info("Marked notification ID {} as seen for user {}", id, user.getEmail());
            return ResponseEntity.ok("Marked as seen");
        } catch (Exception e) {
            log.error("Error marking notification ID {} as seen for user {}: {}", id, user.getEmail(), e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error marking notification as seen");
        }
    }


    @DeleteMapping("/news/notifications/{id}")
    @Transactional

    public ResponseEntity<String> deleteNotification(@AuthenticationPrincipal User user, @PathVariable Long id) {
        if (user == null) {
            log.error("Unauthorized access attempt to delete notification ID {}", id);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized: Please log in.");
        }
        try {
            Notification n = notificationRepo.findById(id).orElseThrow(() ->
                    new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));

            if ("COMMENT".equals(n.getType()) && n.getCommentId() != null) {
                commentRepo.findById(n.getCommentId()).ifPresent(comment -> {
                    commentRepo.delete(comment);
                    log.info("Deleted comment ID {} for notification ID {}", n.getCommentId(), id);
                });
            }
            NotificationResponse response = mapToNotificationResponse(n, user);
            notificationRepo.delete(n);
            messagingTemplate.convertAndSend("/topic/notifications/deleted", response);
            log.info("Deleted notification ID {} for user {}", id, user.getEmail());
            return ResponseEntity.ok("Notification deleted");
        } catch (Exception e) {
            log.error("Error deleting notification ID {} for user {}: {}", id, user.getEmail(), e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error deleting notification");
        }
    }


    @GetMapping("/admin/notifications/unseen")
    public ResponseEntity<List<NotificationResponse>> getUnseenNotifications(@AuthenticationPrincipal User user) {
        if (user == null || !"ADMIN".equals(user.getRole())) {
            log.error("Unauthorized access attempt to fetch unseen notifications by user {}", user != null ? user.getEmail() : "null");
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin privileges required");
        }

        try {
            List<Notification> unseenNotifications = notificationRepo.findBySeenFalse();

            List<NotificationResponse> response = unseenNotifications.stream()
                    .map(n -> {
                        User notificationUser = userRepo.findByEmail(n.getEmail()).orElse(null);
                        return new NotificationResponse(
                                n.getId(),
                                n.getType(),
                                n.getMessage(),
                                n.getNewsId(),
                                n.isSeen(),
                                n.getEmail(),
                                n.getCreatedAt().toString(),
                                n.getCommentId(),
                                notificationUser != null ? notificationUser.getDisplayUsername() : "Unknown"
                        );
                    })
                    .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                    .collect(Collectors.toList());

            log.info("Fetched {} unseen notifications for admin {}", response.size(), user.getEmail());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error fetching unseen notifications for admin {}: {}", user.getEmail(), e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching unseen notifications");
        }
    }


    @GetMapping("/admin/notifications/all")
    public ResponseEntity<List<NotificationResponse>> getAllNotifications(@AuthenticationPrincipal User user) {
        if (user == null || !"ADMIN".equals(user.getRole())) {
            log.error("Unauthorized access attempt to fetch all notifications by user {}", user != null ? user.getEmail() : "null");
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin privileges required");
        }
        try {
            List<Notification> notifications = notificationRepo.findAll();
            List<NotificationResponse> response = notifications.stream()
                    .map(n -> {
                        User notificationUser = userRepo.findByEmail(n.getEmail()).orElse(null);
                        return new NotificationResponse(
                                n.getId(),
                                n.getType(),
                                n.getMessage(),
                                n.getNewsId(),
                                n.isSeen(),
                                n.getEmail(),
                                n.getCreatedAt().toString(),
                                n.getCommentId(),
                                notificationUser != null ? notificationUser.getDisplayUsername() : "Unknown"
                        );
                    })
                    .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                    .collect(Collectors.toList());
            log.info("Fetched {} notifications for admin {}", response.size(), user.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching all notifications for admin {}: {}", user.getEmail(), e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching notifications");
        }
    }

    @PostMapping("/admin/sendWarning")
    public ResponseEntity<Response> sendWarning(@AuthenticationPrincipal User user, @RequestBody WarningRequest request) {
        if (user == null || !"ADMIN".equals(user.getRole())) {
            log.error("Unauthorized access attempt to send warning by user {}", user != null ? user.getEmail() : "null");
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin privileges required");
        }
        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            log.warn("Empty warning message from admin {}", user.getEmail());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Warning message cannot be empty");
        }
        try {
            List<User> allUsers = userRepo.findAll();
            String adminUsername = user.getDisplayUsername() != null ? user.getDisplayUsername() : "Admin";
            List<Notification> notifications = allUsers.stream()
                    .filter(u -> !u.getEmail().equals(user.getEmail()))
                    .map(targetUser -> {
                        Notification notification = new Notification();
                        notification.setType("WARNING");
                        notification.setMessage(request.getMessage() + " (Sent by " + adminUsername + ")");
                        notification.setSeen(false);
                        notification.setEmail(targetUser.getEmail());
                        notification.setCreatedAt(LocalDateTime.now());
                        return notification;
                    })
                    .collect(Collectors.toList());
            notificationRepo.saveAll(notifications);
            notifications.forEach(n -> {
                User targetUser = userRepo.findByEmail(n.getEmail()).orElse(null);
                if (targetUser != null) {
                    NotificationResponse response = mapToNotificationResponse(n, targetUser);
                    messagingTemplate.convertAndSend("/topic/notifications/" + targetUser.getId(), response);
                    log.info("Sent warning notification to user {}", n.getEmail());
                }
            });
            return new ResponseEntity<>(new Response("Warning sent to all users"), HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error sending warning by admin {}: {}", user.getEmail(), e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error sending warning");
        }
    }


    @GetMapping("/user/unseen")
    public ResponseEntity<List<NotificationResponse>> getUserNotifications(@AuthenticationPrincipal User user) {
        if (user == null || user.getEmail() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Notification> notifications = notificationRepo
                .findByEmailAndSeenFalseOrderByCreatedAtDesc(user.getEmail());

        List<NotificationResponse> responseList = notifications.stream()
                .map(n -> new NotificationResponse(
                        n.getId(),
                        n.getType(),
                        n.getMessage(),
                        n.getNewsId(),
                        n.isSeen(),
                        n.getEmail(),
                        n.getCreatedAt().toString(),
                        n.getCommentId(),
                        user.getDisplayUsername() // or user.getUsername() if preferred
                ))
                .toList();

        return ResponseEntity.ok(responseList);
    }

    // Helper method to map Notification to NotificationResponse
    private NotificationResponse mapToNotificationResponse(Notification n, User user) {
        return new NotificationResponse(
                n.getId(),
                n.getType(),
                n.getMessage(),
                n.getNewsId(),
                n.isSeen(),
                n.getEmail(),
                n.getCreatedAt().toString(),
                n.getCommentId(),
                user != null ? user.getDisplayUsername() : "Unknown"
        );
    }



    // DTOs and helper classes
    private static class NotificationResponse {
        private Long id;
        private String type;
        private String message;
        private Long newsId;
        private boolean seen;
        private String email;
        private String createdAt;
        private Long commentId;
        private String username;

        public NotificationResponse(Long id, String type, String message, Long newsId, boolean seen,
                                    String email, String createdAt, Long commentId, String username) {
            this.id = id;
            this.type = type;
            this.message = message;
            this.newsId = newsId;
            this.seen = seen;
            this.email = email;
            this.createdAt = createdAt;
            this.commentId = commentId;
            this.username = username;
        }

        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public Long getNewsId() { return newsId; }
        public void setNewsId(Long newsId) { this.newsId = newsId; }
        public boolean isSeen() { return seen; }
        public void setSeen(boolean seen) { this.seen = seen; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
        public Long getCommentId() { return commentId; }
        public void setCommentId(Long commentId) { this.commentId = commentId; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
    }

    private static class CommentRequest {
        private String content;
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }

    private static class CommentResponse {
        private String content;
        private String username;
        private String email;
        private String createdAt;

        public CommentResponse(String content, String username, String email, String createdAt) {
            this.content = content;
            this.username = username;
            this.email = email;
            this.createdAt = createdAt;
        }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    }

    private static class WarningRequest {
        private String message;
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    private static class Response {
        private String message;
        public Response(String message) { this.message = message; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    private static class UserResponse {
        private Long id;
        private String email;
        private String username;
        private String role;

        public UserResponse(Long id, String email, String username, String role) {
            this.id = id;
            this.email = email;
            this.username = username;
            this.role = role;
        }

        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }
}