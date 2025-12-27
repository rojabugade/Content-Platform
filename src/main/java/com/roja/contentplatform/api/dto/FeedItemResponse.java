package com.roja.contentplatform.api.dto;

import java.time.Instant;
import java.util.List;
import java.util.Set;

public record FeedItemResponse(
    Long id,
    String contentType,
    String region,
    String category,
    Set<String> tags,
    String priority,
    boolean pinned,
    String status,
    Instant publishedAt,
    Instant scheduledUnpublishAt,
    String displayLanguage,
    List<String> availableLanguages,
    String title,
    String createdBy,
    Instant createdAt,
    String approvedBy,
    Instant approvedAt,
    int version,
    boolean internal
) {}
