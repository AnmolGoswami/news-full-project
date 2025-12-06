package com.project_api.config;

import com.project_api.service.JwtService;
import com.project_api.service.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();

        // Skip JWT validation for public endpoints
        if (isPublicEndpoint(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String jwt = jwtService.getTokenFromHeader(request);
            if (jwt != null && jwtService.validateToken(jwt)) {
                String username = jwtService.getUsernameFromToken(jwt);
                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (Exception e) {
            System.err.println("JWT validation failed: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }


    private boolean isPublicEndpoint(String path) {
        return path.startsWith("/api/latest")
                || path.startsWith("/api/newsBy")
                || path.startsWith("/api/getCategories")
                || path.startsWith("/api/getState")
                || path.startsWith("/api/getDistricts")
                || path.startsWith("/api/getLanguage")
                || path.startsWith("/api/newsByLanguage")
                || path.startsWith("/api/get")
                || path.startsWith("/api/stats")
                || path.startsWith("/api/login")
                || path.startsWith("/api/user/loginUser")
                || path.startsWith("/api/user/register")
                || path.startsWith("/api/news/related")
                || path.matches("/api/news/\\d+/view")
                || path.matches("/api/news/\\d+/share")
                || path.matches("/api/news/\\d+")
                || path.matches("/api/comments/\\d+")
                || (path.matches("/api/\\d+/comments"));
    }
}