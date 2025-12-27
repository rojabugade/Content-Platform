package com.roja.contentplatform.api.dto;

import java.time.Instant;
import java.util.Set;

public record CreateContentRequest(
    String contentType, // ARTICLE, POLICY, ANNOUNCEMENT, etc.
    String region,
    String category,
    Set<String> tags,
    String priority, // LOW, NORMAL, HIGH, URGENT
    boolean pinned,
    Instant scheduledPublishAt,
    Instant scheduledUnpublishAt,
    boolean internal
) {}
