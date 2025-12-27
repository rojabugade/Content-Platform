package com.roja.contentplatform.controller;

import com.roja.contentplatform.api.dto.*;
import com.roja.contentplatform.model.ContentItem;
import com.roja.contentplatform.model.ContentVariant;
import com.roja.contentplatform.repository.ContentItemRepository;
import com.roja.contentplatform.repository.ContentVariantRepository;
import com.roja.contentplatform.services.ContentQueryService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/v1")
public class ContentController {

  private final ContentItemRepository itemRepo;
  private final ContentVariantRepository varRepo;
  private final ContentQueryService queryService;

  public ContentController(ContentItemRepository itemRepo, ContentVariantRepository varRepo, ContentQueryService queryService) {
    this.itemRepo = itemRepo;
    this.varRepo = varRepo;
    this.queryService = queryService;
  }

  // ---- Helpers
  private Jwt jwt(Authentication auth) {
    if (auth == null || !(auth.getPrincipal() instanceof Jwt j)) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "JWT required");
    }
    return j;
  }

  @SuppressWarnings("unchecked")
  private List<String> userRegions(Jwt jwt) {
    Object claim = jwt.getClaims().get("regions");
    if (claim instanceof List<?> list) {
      return (List<String>) list;
    }
    // fallback: single region claim
    String region = jwt.getClaimAsString("region");
    return region == null ? List.of() : List.of(region);
  }

  private ContentItem.ContentType contentTypeOrDefault(String value) {
    if (value == null) return ContentItem.ContentType.ARTICLE;
    try {
      return ContentItem.ContentType.valueOf(value);
    } catch (IllegalArgumentException ex) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid contentType");
    }
  }

  private ContentItem.Priority priorityOrDefault(String value) {
    if (value == null) return ContentItem.Priority.NORMAL;
    try {
      return ContentItem.Priority.valueOf(value);
    } catch (IllegalArgumentException ex) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid priority");
    }
  }

  // ---- Authoring

  @PostMapping("/content")
  @ResponseStatus(HttpStatus.CREATED)
  public ContentItem createContent(@RequestBody CreateContentRequest req, Authentication auth) {
    Jwt j = jwt(auth);

    if (req.region() == null || req.category() == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "region and category are required");
    }

    // Enforce author can create in that region
    if (!userRegions(j).contains(req.region())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "not allowed to create content in this region");
    }

    ContentItem item = new ContentItem();
    item.setContentType(contentTypeOrDefault(req.contentType()));
    item.setRegion(req.region());
    item.setCategory(req.category());
    item.setTags(req.tags() == null ? Set.of() : req.tags());
    item.setPriority(priorityOrDefault(req.priority()));
    item.setPinned(req.pinned());
    item.setScheduledPublishAt(req.scheduledPublishAt());
    item.setScheduledUnpublishAt(req.scheduledUnpublishAt());
    item.setInternal(req.internal());
    item.setCreatedBy(j.getSubject());
    item.setLastModifiedBy(j.getSubject());
    item.setLastModifiedAt(Instant.now());
    item.setStatus(ContentItem.Status.DRAFT);
    return itemRepo.save(item);
  }

  @PutMapping("/content/{id}/variants")
  public ContentVariant upsertVariant(@PathVariable Long id, @RequestBody UpsertVariantRequest req, Authentication auth) {
    Jwt j = jwt(auth);

    ContentItem item = itemRepo.findById(id).orElseThrow(() ->
        new ResponseStatusException(HttpStatus.NOT_FOUND, "content not found"));

    if (!userRegions(j).contains(item.getRegion())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "not allowed in this region");
    }

    if (req.languageCode() == null || req.title() == null || req.bodyHtml() == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "languageCode, title, bodyHtml are required");
    }

    ContentVariant v = varRepo.findByContentItemIdAndLanguageCode(id, req.languageCode()).orElseGet(ContentVariant::new);
    v.setContentItem(item);
    v.setLanguageCode(req.languageCode());
    v.setTitle(req.title());
    v.setBodyHtml(req.bodyHtml());
    v.setUpdatedBy(j.getSubject());
    v.setUpdatedAt(Instant.now());

    // If setting default language, unset others
    if (req.isDefaultLang()) {
      List<ContentVariant> all = varRepo.findByContentItemId(id);
      for (ContentVariant other : all) {
        if (!other.getLanguageCode().equals(req.languageCode()) && other.isDefaultLang()) {
          other.setDefaultLang(false);
          varRepo.save(other);
        }
      }
      v.setDefaultLang(true);
    }

    return varRepo.save(v);
  }

  @PostMapping("/content/{id}/publish")
  public ContentItem publish(@PathVariable Long id, Authentication auth) {
    Jwt j = jwt(auth);
    ContentItem item = itemRepo.findById(id).orElseThrow(() ->
        new ResponseStatusException(HttpStatus.NOT_FOUND, "content not found"));

    if (!userRegions(j).contains(item.getRegion())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "not allowed in this region");
    }

    // minimal rule: must have at least one variant to publish
    if (varRepo.findByContentItemId(id).isEmpty()) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "cannot publish without a language variant");
    }

    item.setStatus(ContentItem.Status.PUBLISHED);
    item.setPublishedAt(Instant.now());
    return itemRepo.save(item);
  }

  // ---- Delivery

  @GetMapping("/feed")
  public List<FeedItemResponse> feed(@RequestParam String region,
                                    @RequestParam(required = false) String lang,
                                    Authentication auth) {
    Jwt j = jwt(auth);
    return queryService.getFeed(region, lang, userRegions(j));
  }

  @GetMapping("/content/{id}/view")
  public ContentViewResponse view(@PathVariable Long id,
                                  @RequestParam(required = false) String lang,
                                  Authentication auth) {
    Jwt j = jwt(auth);
    return queryService.getContentView(id, lang, userRegions(j));
  }
}
