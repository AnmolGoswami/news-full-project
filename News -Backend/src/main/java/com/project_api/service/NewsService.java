package com.project_api.service;

import com.project_api.dto.*;
import com.project_api.entity.Language;
import com.project_api.entity.News;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public interface NewsService {

    public String uploadFile(MultipartFile file);


    public News addNews(NewsRequest request,MultipartFile file,String createdBy);


    public News updateNews(Long id,NewsRequest request,MultipartFile file,String createdBy);


    public Map<String,Long> getDashboardStats();


    public List<NewsDTO> getAllNews();

    public List<NewsDTO> getTop5News();

    public List<NewsDTO> getTop10News();

    public List<CategoriesDTO> getCategory();


    public List<DistrictDTO> getDistrict();

    public List<StateDTO> getState();

    public void deleteNews(Long id);

    boolean deleteFile(String fileName);

    void incrementViewCount(Long id);


    List<NewsDTO> getTrendingNews();

    List<NewsDTO> getNewsByCategory(String categoryName);


    NewsDTO getNewsById(Long id);

    void incrementShareCount(Long id);

    public List<NewsDTO> getRelatedNews(Long newsId);

    public List<NewsDTO> getNewsByState(String stateName);
    public List<NewsDTO> getNewsByDistrict(String districtName);
    public List<LanguageDTO> getLanguage();


    public List<NewsDTO> getNewsByLanguage(String language);

    public List<NewsDTO> getNewsFromLast48Hours();



}
