package com.roja.contentplatform.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "content_item")
public class ContentItem {

  public enum Status { DRAFT, IN_REVIEW, APPROVED, PUBLISHED, ARCHIVED }
  public enum ContentType { ARTICLE, POLICY, ANNOUNCEMENT, CAMPAIGN, GUIDELINE, FAQ }
  public enum Priority { LOW, NORMAL, HIGH, URGENT }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private ContentType contentType = ContentType.ARTICLE;

  @Column(nullable = false)
  private String region; // US, JP, RU ...

  @Column(nullable = false)
  private String category; // TRADES, MARKETING, COMPLIANCE, etc.

  @ElementCollection
  @CollectionTable(name = "content_tags", joinColumns = @JoinColumn(name = "content_id"))
  @Column(name = "tag")
  private Set<String> tags = new HashSet<>();

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Status status = Status.DRAFT;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Priority priority = Priority.NORMAL;

  @Column(nullable = false)
  private boolean pinned = false;

  private Instant scheduledPublishAt;
  private Instant scheduledUnpublishAt;

  @Column(nullable = false)
  private Instant createdAt = Instant.now();

  @Column(nullable = false)
  private String createdBy; // from JWT sub

  private String approvedBy;
  private Instant approvedAt;

  private Instant publishedAt;
  private String publishedBy;

  private Instant archivedAt;
  private String archivedBy;

  @Column(nullable = false)
  private Instant lastModifiedAt = Instant.now();

  @Column(nullable = false)
  private String lastModifiedBy;

  @Column(nullable = false)
  private int version = 1;

  @Column(nullable = false)
  private boolean internal = false; // internal vs external visibility

  // getters/setters
  public Long getId() { return id; }
  
  public ContentType getContentType() { return contentType; }
  public void setContentType(ContentType contentType) { this.contentType = contentType; }
  
  public String getRegion() { return region; }
  public void setRegion(String region) { this.region = region; }
  
  public String getCategory() { return category; }
  public void setCategory(String category) { this.category = category; }
  
  public Set<String> getTags() { return tags; }
  public void setTags(Set<String> tags) { this.tags = tags; }
  
  public Status getStatus() { return status; }
  public void setStatus(Status status) { this.status = status; }
  
  public Priority getPriority() { return priority; }
  public void setPriority(Priority priority) { this.priority = priority; }
  
  public boolean isPinned() { return pinned; }
  public void setPinned(boolean pinned) { this.pinned = pinned; }
  
  public Instant getScheduledPublishAt() { return scheduledPublishAt; }
  public void setScheduledPublishAt(Instant scheduledPublishAt) { this.scheduledPublishAt = scheduledPublishAt; }
  
  public Instant getScheduledUnpublishAt() { return scheduledUnpublishAt; }
  public void setScheduledUnpublishAt(Instant scheduledUnpublishAt) { this.scheduledUnpublishAt = scheduledUnpublishAt; }
  
  public Instant getCreatedAt() { return createdAt; }
  
  public String getCreatedBy() { return createdBy; }
  public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
  
  public String getApprovedBy() { return approvedBy; }
  public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }
  
  public Instant getApprovedAt() { return approvedAt; }
  public void setApprovedAt(Instant approvedAt) { this.approvedAt = approvedAt; }
  
  public Instant getPublishedAt() { return publishedAt; }
  public void setPublishedAt(Instant publishedAt) { this.publishedAt = publishedAt; }
  
  public String getPublishedBy() { return publishedBy; }
  public void setPublishedBy(String publishedBy) { this.publishedBy = publishedBy; }
  
  public Instant getArchivedAt() { return archivedAt; }
  public void setArchivedAt(Instant archivedAt) { this.archivedAt = archivedAt; }
  
  public String getArchivedBy() { return archivedBy; }
  public void setArchivedBy(String archivedBy) { this.archivedBy = archivedBy; }
  
  public Instant getLastModifiedAt() { return lastModifiedAt; }
  public void setLastModifiedAt(Instant lastModifiedAt) { this.lastModifiedAt = lastModifiedAt; }
  
  public String getLastModifiedBy() { return lastModifiedBy; }
  public void setLastModifiedBy(String lastModifiedBy) { this.lastModifiedBy = lastModifiedBy; }
  
  public int getVersion() { return version; }
  public void setVersion(int version) { this.version = version; }
  
  public boolean isInternal() { return internal; }
  public void setInternal(boolean internal) { this.internal = internal; }
}
