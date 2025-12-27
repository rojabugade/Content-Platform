package com.roja.contentplatform.repository;

import com.roja.contentplatform.model.ContentVariant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ContentVariantRepository extends JpaRepository<ContentVariant, Long> {
  Optional<ContentVariant> findByContentItemIdAndLanguageCode(Long contentItemId, String languageCode);
  List<ContentVariant> findByContentItemId(Long contentItemId);
  Optional<ContentVariant> findFirstByContentItemIdAndIsDefaultLangTrue(Long contentItemId);
}
