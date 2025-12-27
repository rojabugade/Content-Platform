package com.roja.contentplatform.services;


import com.roja.contentplatform.api.dto.ContentViewResponse;
import com.roja.contentplatform.api.dto.FeedItemResponse;
import com.roja.contentplatform.model.ContentItem;
import com.roja.contentplatform.model.ContentVariant;
import com.roja.contentplatform.repository.ContentItemRepository;
import com.roja.contentplatform.repository.ContentVariantRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;

@Service
public class ContentQueryService {

  private final ContentItemRepository itemRepo;
  private final ContentVariantRepository varRepo;

  public ContentQueryService(ContentItemRepository itemRepo, ContentVariantRepository varRepo) {
    this.itemRepo = itemRepo;
    this.varRepo = varRepo;
  }

  public ContentViewResponse getContentView(Long id, String requestedLang, List<String> userRegions) {
    ContentItem item = itemRepo.findById(id).orElseThrow(() ->
        new ResponseStatusException(HttpStatus.NOT_FOUND, "content not found"));

    enforceRegion(item.getRegion(), userRegions);

    List<ContentVariant> variants = varRepo.findByContentItemId(id);
    if (variants.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "no language variants exist for this content");
    }

    List<String> available = variants.stream()
        .map(ContentVariant::getLanguageCode)
        .distinct().sorted()
        .toList();

    ContentVariant chosen = null;
    if (requestedLang != null && !requestedLang.isBlank()) {
      chosen = varRepo.findByContentItemIdAndLanguageCode(id, requestedLang).orElse(null);
    }
    if (chosen == null) {
      chosen = varRepo.findFirstByContentItemIdAndIsDefaultLangTrue(id)
          .orElseGet(() -> variants.stream().min(Comparator.comparing(ContentVariant::getLanguageCode)).orElseThrow());
    }

    return new ContentViewResponse(
        item.getId(),
        item.getContentType().name(),
        item.getRegion(),
        item.getCategory(),
        item.getTags(),
        item.getPriority().name(),
        item.getStatus().name(),
        item.getPublishedAt(),
        chosen.getLanguageCode(),
        available,
        chosen.getTitle(),
        chosen.getBodyHtml(),
        item.getCreatedBy(),
        item.getCreatedAt(),
        item.getApprovedBy(),
        item.getApprovedAt(),
        item.getVersion(),
        item.isInternal()
    );
  }

  public List<FeedItemResponse> getFeed(String region, String lang, List<String> userRegions) {
    enforceRegion(region, userRegions);

    List<ContentItem> published = itemRepo.findByRegionAndStatusOrderByPublishedAtDesc(region, ContentItem.Status.PUBLISHED);

    return published.stream().map(item -> {
      List<ContentVariant> vars = varRepo.findByContentItemId(item.getId());
      List<String> available = vars.stream().map(ContentVariant::getLanguageCode).distinct().sorted().toList();

      ContentVariant chosen = null;
      if (lang != null && !lang.isBlank()) {
        chosen = varRepo.findByContentItemIdAndLanguageCode(item.getId(), lang).orElse(null);
      }
      if (chosen == null) {
        chosen = varRepo.findFirstByContentItemIdAndIsDefaultLangTrue(item.getId())
            .orElse(vars.get(0));
      }

      return new FeedItemResponse(
          item.getId(),
          item.getContentType().name(),
          item.getRegion(),
          item.getCategory(),
          item.getTags(),
          item.getPriority().name(),
          item.isPinned(),
          item.getStatus().name(),
          item.getPublishedAt(),
          item.getScheduledUnpublishAt(),
          chosen.getLanguageCode(),
          available,
          chosen.getTitle(),
          item.getCreatedBy(),
          item.getCreatedAt(),
          item.getApprovedBy(),
          item.getApprovedAt(),
          item.getVersion(),
          item.isInternal()
      );
    }).toList();
  }

  private void enforceRegion(String contentRegion, List<String> userRegions) {
    if (userRegions == null || userRegions.isEmpty() || !userRegions.contains(contentRegion)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "not allowed to access this region");
    }
  }
}
