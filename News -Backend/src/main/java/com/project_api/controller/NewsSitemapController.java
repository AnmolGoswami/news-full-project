package com.project_api.controller;



import com.project_api.dto.NewsDTO;
import com.project_api.service.NewsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
public class NewsSitemapController {

    @Autowired
    private NewsService newsService;

    @GetMapping(value = "/news-sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    @Cacheable(value = "newsSitemap", key = "'news-sitemap'")
    public String getNewsSitemap() {
        // Fetch news from the last 48 hours, limit to 1000 for Google News compliance
        List<NewsDTO> newsList = newsService.getNewsFromLast48Hours().stream()
                .limit(1000)
                .toList();

        StringBuilder sb = new StringBuilder();
        sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        sb.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\" ")
                .append("xmlns:news=\"http://www.google.com/schemas/sitemap-news/0.9\">\n");

        DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;

        for (NewsDTO news : newsList) {
            sb.append("  <url>\n");
            sb.append("    <loc>https://www.talewire.com/news/")
                    .append(news.getId()).append("/").append(slugify(news.getTitle())).append("</loc>\n");
            sb.append("    <news:news>\n");
            sb.append("      <news:publication>\n");
            sb.append("        <news:name>Talewire</news:name>\n");
            sb.append("        <news:language>").append(news.getLanguage() != null ? news.getLanguage() : "en").append("</news:language>\n");
            sb.append("      </news:publication>\n");
            sb.append("      <news:publication_date>")
                    .append(news.getPublishedDate() != null ? news.getPublishedDate().format(formatter) : "").append("</news:publication_date>\n");
            sb.append("      <news:title>").append(escapeXml(news.getTitle())).append("</news:title>\n");
            sb.append("      <news:keywords>")
                    .append(generateKeywords(news)).append("</news:keywords>\n");
            sb.append("    </news:news>\n");
            sb.append("  </url>\n");
        }

        sb.append("</urlset>");
        return sb.toString();
    }

    private String slugify(String title) {
        if (title == null || title.trim().isEmpty()) {
            return "news-article";
        }
        return title.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }

    private String escapeXml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }

    private String generateKeywords(NewsDTO news) {
        StringBuilder keywords = new StringBuilder();
        if (news.getCategoryName() != null) keywords.append(news.getCategoryName()).append(", ");
        if (news.getStateName() != null) keywords.append(news.getStateName()).append(", ");
        if (news.getDistrictName() != null) keywords.append(news.getDistrictName()).append(", ");
        if (news.getTitle() != null) {
            String[] titleWords = news.getTitle().split(" ");
            for (int i = 0; i < Math.min(3, titleWords.length); i++) {
                keywords.append(titleWords[i].toLowerCase()).append(", ");
            }
        }
        keywords.append("breaking news, local news, India");
        return keywords.toString();
    }
}