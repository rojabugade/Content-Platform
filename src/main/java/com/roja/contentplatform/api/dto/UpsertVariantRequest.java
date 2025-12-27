package com.roja.contentplatform.api.dto;

public record UpsertVariantRequest(String languageCode, String title, String bodyHtml, boolean isDefaultLang) {
}
