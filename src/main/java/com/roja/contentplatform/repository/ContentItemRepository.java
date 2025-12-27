package com.roja.contentplatform.repository;

import com.roja.contentplatform.model.ContentItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ContentItemRepository extends JpaRepository<ContentItem, Long> {
  List<ContentItem> findByRegionAndStatusOrderByPublishedAtDesc(String region, ContentItem.Status status);
}
