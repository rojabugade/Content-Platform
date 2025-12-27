package com.roja.contentplatform.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(
  name = "content_variant",
  uniqueConstraints = @UniqueConstraint(columnNames = {"content_item_id", "languageCode"})
)
public class ContentVariant {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "content_item_id", nullable = false)
  private ContentItem contentItem;

  @Column(nullable = false)
  private String languageCode; // en, ja, ru...

  @Column(nullable = false)
  private String title;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String bodyHtml;

  @Column(nullable = false)
  private boolean isDefaultLang = false;

  @Column(nullable = false)
  private Instant updatedAt = Instant.now();

  @Column(nullable = false)
  private String updatedBy;

  // getters/setters
  public Long getId() { return id; }
  public ContentItem getContentItem() { return contentItem; }
  public void setContentItem(ContentItem contentItem) { this.contentItem = contentItem; }
  public String getLanguageCode() { return languageCode; }
  public void setLanguageCode(String languageCode) { this.languageCode = languageCode; }
  public String getTitle() { return title; }
  public void setTitle(String title) { this.title = title; }
  public String getBodyHtml() { return bodyHtml; }
  public void setBodyHtml(String bodyHtml) { this.bodyHtml = bodyHtml; }
  public boolean isDefaultLang() { return isDefaultLang; }
  public void setDefaultLang(boolean defaultLang) { isDefaultLang = defaultLang; }
  public Instant getUpdatedAt() { return updatedAt; }
  public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
  public String getUpdatedBy() { return updatedBy; }
  public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
}
