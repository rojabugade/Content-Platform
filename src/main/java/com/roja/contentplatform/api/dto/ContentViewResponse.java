package com.roja.contentplatform.api.dto;

import java.time.Instant;
import java.util.List;
import java.util.Set;

public record ContentViewResponse(
    Long id,
    String contentType,
    String region,
    String category,
    Set<String> tags,
    String priority,
    String status,
    Instant publishedAt,
    String selectedLanguage,
    List<String> availableLanguages,
    String title,
    String bodyHtml,
    String createdBy,
    Instant createdAt,
    String approvedBy,
    Instant approvedAt,
    int version,
    boolean internal
) {}
