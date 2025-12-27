package com.roja.contentplatform.auth.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenCustomizer;
import org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext;

@Configuration
public class TokenCustomizerConfig {

  @Bean
  OAuth2TokenCustomizer<JwtEncodingContext> jwtCustomizer() {
    return context -> {
      Authentication principal = context.getPrincipal();

      // Roles -> claim (optional)
      List<String> roles = principal.getAuthorities().stream()
          .map(GrantedAuthority::getAuthority)
          .toList();
      context.getClaims().claim("roles", roles);

      // Demo region assignment based on username (replace later with DB)
      String username = principal.getName();
      if ("admin".equals(username)) {
        context.getClaims().claim("regions", List.of("US", "JP", "RU"));
      } else if ("editor".equals(username)) {
        context.getClaims().claim("regions", List.of("JP"));
      } else {
        context.getClaims().claim("regions", List.of("US"));
      }
    };
  }
}
