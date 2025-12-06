package com.project_api.service;

import com.cloudinary.Cloudinary;
import com.project_api.dto.*;
import com.project_api.entity.*;
import com.project_api.repo.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;


import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Logger;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NewsServiceImpl implements NewsService {

    private final Cloudinary cloudinary;

    private final NewsRepo newsRepo;
    private final StateRepo stateRepo;
    private final DistrictRepo districtRepo;
    private final CategoryRepo categoryRepo;
    private final LanguageRepo languageRepo;


    private static final Pattern URL_PATTERN = Pattern.compile(
            "^(https?://)?([\\w-]+\\.)+[\\w-]+(/[\\w-./?%&=]*)?$");

    @Override
    public String uploadFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            log.error("File is null or empty");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File cannot be null or empty");
        }
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.contains(".")) {
            log.error("Invalid file name: {}", originalFilename);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file name");
        }
        String fileNameExtension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1);
        String publicId = UUID.randomUUID().toString() + "." + fileNameExtension;

        try {
            Map params = Map.of(
                    "upload_preset", "news_upload",
                    "folder", "news_images",
                    "public_id", publicId
            );
            Map result = cloudinary.uploader().upload(file.getBytes(), params);
            String secureUrl = (String) result.get("secure_url");
            log.info("File uploaded successfully: {}", secureUrl);
            return secureUrl;
        } catch (IOException e) {
            log.error("Error uploading file to Cloudinary: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error uploading file: " + e.getMessage());
        }
    }

    @Override
    public News addNews(NewsRequest request, MultipartFile file, String createdBy) {
        validateNewsRequest(request);
        String imageUrl = file != null && !file.isEmpty() ? uploadFile(file) : null;
        News news = new News();
        news.setTitle(request.getTitle());
        news.setContent(request.getContent());
        news.setCreatedBy(createdBy);
        news.setCreatedAt(LocalDateTime.now());

        State state = stateRepo.findByName(request.getState())
                .orElseGet(() -> {
                    State newState = new State();
                    newState.setName(request.getState());
                    log.info("Created new state: {}", request.getState());
                    return stateRepo.save(newState);
                });
        news.setState(state);

        Category category = categoryRepo.findByName(request.getCategory())
                .orElseGet(() -> {
                    Category newCategory = new Category();
                    newCategory.setName(request.getCategory());
                    log.info("Created new category: {}", request.getCategory());
                    return categoryRepo.save(newCategory);
                });
        news.setCategory(category);

        Language language = languageRepo.findByName(request.getLanguage())
                .orElseGet(()->{
                    Language newLanguage = new Language();
                    newLanguage.setName(request.getLanguage());
                    log.info("Created new language: {}",request.getLanguage());
                    return languageRepo.save(newLanguage);
                });
        news.setLanguage(language);

        District district = districtRepo.findByNameAndState(request.getDistrict(), state)
                .orElseGet(() -> {
                    District newDistrict = new District();
                    newDistrict.setName(request.getDistrict());
                    newDistrict.setState(state);
                    log.info("Created new district: {} for state: {}", request.getDistrict(), state.getName());
                    return districtRepo.save(newDistrict);
                });
        if (!district.getState().getName().equals(request.getState())) {
            log.error("District {} is associated with state {}, but provided state is {}",
                    request.getDistrict(), district.getState().getName(), request.getState());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "District " + request.getDistrict() + " is associated with state " +
                            district.getState().getName() + ", but provided state is " + request.getState());
        }
        news.setDistrict(district);

        if (request.getVideoLink() != null && !request.getVideoLink().trim().isEmpty()) {
            if (!URL_PATTERN.matcher(request.getVideoLink()).matches()) {
                log.error("Invalid video link: {}", request.getVideoLink());
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid video link format");
            }
            news.setVideoLink(request.getVideoLink());
        }
        news.setImageUrl(imageUrl);
        news.setPublishedDate(request.getPublishDate() != null ? request.getPublishDate() : LocalDateTime.now());
        news.setViewCount(0L);
        news.setShareCount(0L);
        News savedNews = newsRepo.save(news);
        log.info("News created successfully: ID {}, Title {}", savedNews.getId(), savedNews.getTitle());
        return savedNews;
    }

    @Override
    public News updateNews(Long id, NewsRequest request, MultipartFile file, String createdBy) {
        validateNewsRequest(request);
        News news = newsRepo.findById(id)
                .orElseThrow(() -> {
                    log.error("News not found for ID: {}", id);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "News article not found");
                });

        if (!news.getCreatedBy().equals(createdBy)) {
            log.error("User {} not authorized to update news ID {}", createdBy, id);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to update this news");
        }

        if (file != null && !file.isEmpty()) {
            if (news.getImageUrl() != null) {
                String oldFileName = news.getImageUrl().substring(news.getImageUrl().lastIndexOf("/") + 1);
                if (!deleteFile(oldFileName)) {
                    log.error("Failed to delete old image: {}", oldFileName);
                    throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to delete old image");
                }
            }
            String imageUrl = uploadFile(file);
            news.setImageUrl(imageUrl);
        }

        news.setTitle(request.getTitle());
        news.setContent(request.getContent());

        State state = stateRepo.findByName(request.getState())
                .orElseGet(() -> {
                    State newState = new State();
                    newState.setName(request.getState());
                    log.info("Created new state: {}", request.getState());
                    return stateRepo.save(newState);
                });
        news.setState(state);

        Category category = categoryRepo.findByName(request.getCategory())
                .orElseGet(() -> {
                    Category newCategory = new Category();
                    newCategory.setName(request.getCategory());
                    log.info("Created new category: {}", request.getCategory());
                    return categoryRepo.save(newCategory);
                });
        news.setCategory(category);

        Language language = languageRepo.findByName(request.getLanguage())
                .orElseGet(()-> {
                    Language newLanguage = new Language();
                    newLanguage.setName(request.getLanguage());
                    log.info("Created new language: {}",request.getLanguage());
                    return languageRepo.save(newLanguage);
                });
        news.setLanguage(language);

        District district = districtRepo.findByNameAndState(request.getDistrict(), state)
                .orElseGet(() -> {
                    District newDistrict = new District();
                    newDistrict.setName(request.getDistrict());
                    newDistrict.setState(state);
                    log.info("Created new district: {} for state: {}", request.getDistrict(), state.getName());
                    return districtRepo.save(newDistrict);
                });
        if (!district.getState().getName().equals(request.getState())) {
            log.error("District {} is associated with state {}, but provided state is {}",
                    request.getDistrict(), district.getState().getName(), request.getState());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "District " + request.getDistrict() + " is associated with state " +
                            district.getState().getName() + ", but provided state is " + request.getState());
        }
        news.setDistrict(district);



        if (request.getVideoLink() != null && !request.getVideoLink().trim().isEmpty()) {
            if (!URL_PATTERN.matcher(request.getVideoLink()).matches()) {
                log.error("Invalid video link: {}", request.getVideoLink());
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid video link format");
            }
            news.setVideoLink(request.getVideoLink());
        } else {
            news.setVideoLink(null);
        }
        news.setPublishedDate(request.getPublishDate() != null ? request.getPublishDate() : LocalDateTime.now());
        News savedNews = newsRepo.save(news);
        log.info("News updated successfully: ID {}, Title {}", savedNews.getId(), savedNews.getTitle());
        return savedNews;
    }

    @Override
    public Map<String, Long> getDashboardStats() {
        try {
            Map<String, Long> stats = new HashMap<>();
            stats.put("totalStates", stateRepo.count());
            stats.put("totalDistricts", districtRepo.count());
            stats.put("totalCategories", categoryRepo.count());
            stats.put("totalArticles", newsRepo.count());
            stats.put("totalLanguage",languageRepo.count());
            log.debug("Fetched dashboard stats: {}", stats);
            return stats;
        } catch (Exception e) {
            log.error("Error fetching dashboard stats: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching stats");
        }
    }

    @Override
    public List<NewsDTO> getAllNews() {
        try {
            List<News> newsList = newsRepo.findAll();
            log.debug("Fetched {} news articles", newsList.size());
            return newsList.stream().map(this::convertToDTO).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching all news: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching news");
        }
    }

    @Override
    public List<NewsDTO> getTop5News() {
        try {
            List<News> newsList = newsRepo.findTop5ByOrderByPublishedDateDesc();
            log.debug("Fetched top 5 news articles");
            return newsList.stream().map(this::convertToDTO).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching top 5 news: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching top 5 news");
        }
    }

    @Override
    public List<NewsDTO> getTop10News() {
        try {
            List<News> newsList = newsRepo.findTop10ByOrderByPublishedDateDesc();
            log.debug("Fetched top 10 news articles");
            return newsList.stream().map(this::convertToDTO).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching top 10 news: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching top 10 news");
        }
    }

    @Override
    public List<CategoriesDTO> getCategory() {
        try {
            List<Category> categoryList = categoryRepo.findAll();
            log.debug("Fetched {} categories", categoryList.size());
            return categoryList.stream().map(this::convertToCategoryDTO).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching categories: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching categories");
        }
    }

    @Override
    public List<DistrictDTO> getDistrict() {
        try {
            List<District> districtList = districtRepo.findAll();
            log.debug("Fetched {} districts", districtList.size());
            return districtList.stream().map(this::convertToDistrictDTO).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching districts: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching districts");
        }
    }

    @Override
    public List<LanguageDTO> getLanguage(){
        try{
            List<Language> languageList = languageRepo.findAll();
            log.debug("Fetched {} language", languageList.size());
            return languageList.stream().map(this::convertToLanguageDTO).collect(Collectors.toList());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,"Error fetching language ");
        }
    }


    @Override
    public List<StateDTO> getState() {
        try {
            List<State> stateList = stateRepo.findAll();
            log.debug("Fetched {} states", stateList.size());
            return stateList.stream().map(this::convertToStateDTO).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching states: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching states");
        }
    }

    @Override
    @Transactional
    public void deleteNews(Long id) {
        News news = newsRepo.findById(id)
                .orElseThrow(() -> {
                    log.error("News not found for ID: {}", id);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "News not found");
                });

        if (news.getImageUrl() != null) {
            String fileName = news.getImageUrl().substring(news.getImageUrl().lastIndexOf("/") + 1);
            if (!deleteFile(fileName)) {
                log.error("Failed to delete image: {}", fileName);
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to delete image");
            }
        }

        newsRepo.delete(news); // ✅ Fix here
        log.info("News deleted successfully: ID {}", id);
    }


    @Override
    public boolean deleteFile(String publicId) {
        try {
            if (publicId == null || publicId.trim().isEmpty()) {
                log.warn("Invalid public ID for deletion: {}", publicId);
                return false;
            }
            // Extract public_id if fileName is a full URL (e.g., from imageUrl in News)
            String cloudinaryPublicId = publicId.contains("/")
                    ? publicId.substring(publicId.lastIndexOf("/") + 1).replaceFirst("[.][^.]+$", "")
                    : publicId;

            cloudinary.uploader().destroy(cloudinaryPublicId, Map.of());
            log.info("File deleted from Cloudinary: {}", cloudinaryPublicId);
            return true;
        } catch (Exception e) {
            log.error("Error deleting file from Cloudinary: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public void incrementViewCount(Long id) {
        News news = newsRepo.findById(id)
                .orElseThrow(() -> {
                    log.error("News not found for ID: {}", id);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "News not found");
                });
        news.setViewCount(news.getViewCount() + 1);
        newsRepo.save(news);
        log.debug("Incremented view count for news ID: {}", id);
    }

    @Override
    public void incrementShareCount(Long id) {
        News news = newsRepo.findById(id)
                .orElseThrow(() -> {
                    log.error("News not found for ID: {}", id);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "News not found");
                });
        news.setShareCount(news.getShareCount() + 1);
        newsRepo.save(news);
        log.debug("Incremented share count for news ID: {}", id);
    }

    @Override
    public List<NewsDTO> getTrendingNews() {
        try {
            List<News> trendingNews = newsRepo.findTop10ByOrderByViewCountDesc();
            log.debug("Fetched {} trending news articles", trendingNews.size());
            return trendingNews.stream().map(this::convertToDTO).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching trending news: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching trending news");
        }
    }

    @Override
    public List<NewsDTO> getNewsByCategory(String categoryName) {
        if (categoryName == null || categoryName.trim().isEmpty()) {
            log.error("Invalid category name: {}", categoryName);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category name cannot be empty");
        }
        try {
            List<News> newsList = newsRepo.findByCategory_NameIgnoreCase(categoryName);
            log.debug("Fetched {} news articles for category: {}", newsList.size(), categoryName);
            return newsList.stream().map(this::convertToDTO).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching news by category {}: {}", categoryName, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching news by category");
        }
    }

    @Override
    public List<NewsDTO> getNewsByLanguage(String language){
        if (language == null || language.trim().isEmpty()){
            log.error("Invalid language name : {}", language);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Language name cannot be empty");
        }
        try {
            List<News> newsList = newsRepo.findByLanguage_NameIgnoreCase(language);
            log.debug("Fetched {} news articles for language : {}", newsList.size() , language);
            return newsList.stream().map(this::convertToDTO).collect(Collectors.toList());
        } catch (Exception e){
            log.error("Error fetching news by category {}: {}",language,e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,"Error fetching news by language");
        }
    }

    @Override
    public List<NewsDTO> getNewsByState(String stateName) {
        if (stateName == null || stateName.trim().isEmpty()) {
            log.error("Invalid state name: {}", stateName);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "State name cannot be empty");
        }
        try {
            List<News> newsList = newsRepo.findByState_NameIgnoreCase(stateName);
            log.debug("Fetched {} news articles for state: {}", newsList.size(), stateName);
            return newsList.stream().map(this::convertToDTO).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching news by state {}: {}", stateName, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching news by state");
        }
    }

    @Override
    public List<NewsDTO> getNewsByDistrict(String districtName) {
        if (districtName == null || districtName.trim().isEmpty()) {
            log.error("Invalid district name: {}", districtName);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "District name cannot be empty");
        }
        try {
            List<News> newsList = newsRepo.findByDistrict_NameIgnoreCase(districtName);
            log.debug("Fetched {} news articles for district: {}", newsList.size(), districtName);
            return newsList.stream().map(this::convertToDTO).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching news by district {}: {}", districtName, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching news by district");
        }
    }

    @Override
    public NewsDTO getNewsById(Long id) {
        try {
            News news = newsRepo.findById(id)
                    .orElseThrow(() -> {
                        log.error("News not found for ID: {}", id);
                        return new ResponseStatusException(HttpStatus.NOT_FOUND, "News not found");
                    });
            log.debug("Fetched news ID: {}", id);
            return convertToDTO(news);
        } catch (Exception e) {
            log.error("Error fetching news by ID {}: {}", id, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching news");
        }
    }

    @Override
    public List<NewsDTO> getRelatedNews(Long newsId) {
        try {
            News currentNews = newsRepo.findById(newsId)
                    .orElseThrow(() -> {
                        log.error("News not found for ID: {}", newsId);
                        return new ResponseStatusException(HttpStatus.NOT_FOUND, "News not found");
                    });
            List<News> related = newsRepo.findTop5ByCategoryAndIdNotOrderByPublishedDateDesc(
                    currentNews.getCategory(), newsId);
            log.debug("Fetched {} related news articles for ID: {}", related.size(), newsId);
            return related.stream().map(this::convertToDTO).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching related news for ID {}: {}", newsId, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching related news");
        }
    }

    private void validateNewsRequest(NewsRequest request) {
        if (request == null) {
            log.error("News request is null");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "News request cannot be null");
        }
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            log.error("News title is null or empty");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title cannot be empty");
        }
        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            log.error("News content is null or empty");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Content cannot be empty");
        }
        if (request.getState() == null || request.getState().trim().isEmpty()) {
            log.error("State is null or empty");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "State cannot be empty");
        }
        if (request.getDistrict() == null || request.getDistrict().trim().isEmpty()) {
            log.error("District is null or empty");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "District cannot be empty");
        }
        if (request.getCategory() == null || request.getCategory().trim().isEmpty()) {
            log.error("Category is null or empty");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category cannot be empty");
        }
        if (request.getLanguage() == null || request.getLanguage().trim().isEmpty()) {
            log.error("Language is null or empty");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Language cannot be empty");
        }
    }

    private NewsDTO convertToDTO(News news) {
        return new NewsDTO(
                news.getId(),
                news.getTitle(),
                news.getContent(),
                news.getState() != null ? news.getState().getName() : null,
                news.getDistrict() != null ? news.getDistrict().getName() : null,
                news.getCategory() != null ? news.getCategory().getName() : null,
                news.getLanguage() != null ? news.getLanguage().getName() : null,
                news.getPublishedDate(),
                news.getVideoLink(),
                news.getImageUrl(),
                news.getViewCount(),
                news.getShareCount(),
                news.getCreatedBy()
        );
    }

    private StateDTO convertToStateDTO(State state) {
        return new StateDTO(
                state.getId(),
                state.getName(),
                state.getDistricts()
        );
    }

    private CategoriesDTO convertToCategoryDTO(Category category) {
        return new CategoriesDTO(category.getId(), category.getName());
    }

    private DistrictDTO convertToDistrictDTO(District district) {
        return new DistrictDTO(
                district.getId(),
                district.getName(),
                district.getState() != null ? district.getState().getId() : null
        );
    }

    private LanguageDTO convertToLanguageDTO(Language language){
        return new LanguageDTO(
                language.getId(),
                language.getName()
        );
    }

    @Override
    public List<NewsDTO> getNewsFromLast48Hours() {
        // Use Asia/Kolkata to ensure consistent timezone
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Kolkata"));
        LocalDateTime from = now.minusHours(48);

        List<News> newsList = newsRepo.findByPublishedDateBetween(from, now);

        return newsList.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private NewsDTO mapToDTO(News news) {
        NewsDTO dto = new NewsDTO();
        dto.setId(news.getId());
        dto.setTitle(news.getTitle());
        dto.setPublishedDate(news.getPublishedDate());
        dto.setLanguage(news.getLanguage().getName());
        dto.setCategoryName(news.getCategory().getName());
        dto.setStateName(news.getState().getName());
        dto.setDistrictName(news.getDistrict().getName());
        return dto;
    }
}