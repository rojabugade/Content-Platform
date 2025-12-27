package com.roja.contentplatform.config;

import com.roja.contentplatform.model.ContentItem;
import com.roja.contentplatform.model.ContentVariant;
import com.roja.contentplatform.repository.ContentItemRepository;
import com.roja.contentplatform.repository.ContentVariantRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ContentItemRepository itemRepo;
    private final ContentVariantRepository variantRepo;

    public DataInitializer(ContentItemRepository itemRepo, ContentVariantRepository variantRepo) {
        this.itemRepo = itemRepo;
        this.variantRepo = variantRepo;
    }

    @Override
    public void run(String... args) throws Exception {
        if (itemRepo.count() > 0) {
            return;
        }

        // US - Dashboard Analytics
        ContentItem item1 = new ContentItem();
        item1.setRegion("US");
        item1.setCategory("PRODUCT_UPDATES");
        item1.setTags(createTagSet("launch", "feature"));
        item1.setPriority(ContentItem.Priority.HIGH);
        item1.setPinned(true);
        item1.setStatus(ContentItem.Status.PUBLISHED);
        item1.setPublishedAt(Instant.now().minusSeconds(86400));
        item1.setCreatedBy("sarah.williams");
        item1.setApprovedBy("james.chen");
        item1.setApprovedAt(Instant.now().minusSeconds(172800));
        item1.setVersion(1);
        item1.setInternal(false);
        ContentItem saved1 = itemRepo.save(item1);

        ContentVariant var1 = new ContentVariant();
        var1.setContentItem(saved1);
        var1.setLanguageCode("en");
        var1.setTitle("New Dashboard Analytics Released");
        var1.setBodyHtml("<p>We've launched advanced analytics features for real-time dashboard insights. Track metrics, create custom reports, and export data effortlessly.</p>");
        var1.setDefaultLang(true);
        var1.setUpdatedBy("sarah.williams");
        variantRepo.save(var1);

        ContentVariant var1_jp = new ContentVariant();
        var1_jp.setContentItem(saved1);
        var1_jp.setLanguageCode("ja");
        var1_jp.setTitle("新しいダッシュボード分析がリリースされました");
        var1_jp.setBodyHtml("<p>リアルタイムダッシュボード分析の高度な機能をリリースしました。</p>");
        var1_jp.setDefaultLang(false);
        var1_jp.setUpdatedBy("sarah.williams");
        variantRepo.save(var1_jp);

        // JP - Security Policy
        ContentItem item2 = new ContentItem();
        item2.setRegion("JP");
        item2.setCategory("POLICIES");
        item2.setTags(createTagSet("compliance", "security"));
        item2.setPriority(ContentItem.Priority.URGENT);
        item2.setPinned(false);
        item2.setStatus(ContentItem.Status.PUBLISHED);
        item2.setPublishedAt(Instant.now().minusSeconds(259200));
        item2.setCreatedBy("tanaka.yuki");
        item2.setApprovedBy("suzuki.kenji");
        item2.setApprovedAt(Instant.now().minusSeconds(345600));
        item2.setVersion(2);
        item2.setInternal(true);
        ContentItem saved2 = itemRepo.save(item2);

        ContentVariant var2_ja = new ContentVariant();
        var2_ja.setContentItem(saved2);
        var2_ja.setLanguageCode("ja");
        var2_ja.setTitle("データセキュリティポリシー更新");
        var2_ja.setBodyHtml("<p>新しいデータセキュリティポリシーが発効します。</p>");
        var2_ja.setDefaultLang(true);
        var2_ja.setUpdatedBy("tanaka.yuki");
        variantRepo.save(var2_ja);

        // RU - Training Announcement
        ContentItem item3 = new ContentItem();
        item3.setRegion("RU");
        item3.setCategory("ANNOUNCEMENTS");
        item3.setTags(createTagSet("announcement", "training"));
        item3.setPriority(ContentItem.Priority.NORMAL);
        item3.setPinned(false);
        item3.setStatus(ContentItem.Status.PUBLISHED);
        item3.setPublishedAt(Instant.now().minusSeconds(432000));
        item3.setCreatedBy("ivanov.boris");
        item3.setApprovedBy("volkov.dmitri");
        item3.setApprovedAt(Instant.now().minusSeconds(518400));
        item3.setVersion(1);
        item3.setInternal(false);
        ContentItem saved3 = itemRepo.save(item3);

        ContentVariant var3_ru = new ContentVariant();
        var3_ru.setContentItem(saved3);
        var3_ru.setLanguageCode("ru");
        var3_ru.setTitle("Начало подготовки к новому году");
        var3_ru.setBodyHtml("<p>Новый год — отличное время для обновления ваших навыков и знаний.</p>");
        var3_ru.setDefaultLang(true);
        var3_ru.setUpdatedBy("ivanov.boris");
        variantRepo.save(var3_ru);

        // US - Guidelines
        ContentItem item4 = new ContentItem();
        item4.setRegion("US");
        item4.setCategory("GUIDELINES");
        item4.setTags(createTagSet("documentation", "best-practices"));
        item4.setPriority(ContentItem.Priority.NORMAL);
        item4.setPinned(false);
        item4.setStatus(ContentItem.Status.PUBLISHED);
        item4.setPublishedAt(Instant.now().minusSeconds(604800));
        item4.setCreatedBy("alice.johnson");
        item4.setApprovedBy("bob.smith");
        item4.setApprovedAt(Instant.now().minusSeconds(691200));
        item4.setVersion(3);
        item4.setInternal(false);
        ContentItem saved4 = itemRepo.save(item4);

        ContentVariant var4_en = new ContentVariant();
        var4_en.setContentItem(saved4);
        var4_en.setLanguageCode("en");
        var4_en.setTitle("API Integration Best Practices");
        var4_en.setBodyHtml("<p>Follow these guidelines to ensure seamless API integrations with proper error handling and security.</p>");
        var4_en.setDefaultLang(true);
        var4_en.setUpdatedBy("alice.johnson");
        variantRepo.save(var4_en);

        // JP - FAQ
        ContentItem item5 = new ContentItem();
        item5.setRegion("JP");
        item5.setCategory("FAQ");
        item5.setTags(createTagSet("support", "help"));
        item5.setPriority(ContentItem.Priority.LOW);
        item5.setPinned(false);
        item5.setStatus(ContentItem.Status.PUBLISHED);
        item5.setPublishedAt(Instant.now().minusSeconds(172800));
        item5.setCreatedBy("support.team");
        item5.setApprovedBy("manager.jp");
        item5.setApprovedAt(Instant.now().minusSeconds(259200));
        item5.setVersion(1);
        item5.setInternal(false);
        ContentItem saved5 = itemRepo.save(item5);

        ContentVariant var5_ja = new ContentVariant();
        var5_ja.setContentItem(saved5);
        var5_ja.setLanguageCode("ja");
        var5_ja.setTitle("よくある質問（FAQ）");
        var5_ja.setBodyHtml("<h3>Q: パスワードをリセットするには？</h3><p>A: 「ログイン」ページで「パスワードを忘れた」をクリックしてください。</p>");
        var5_ja.setDefaultLang(true);
        var5_ja.setUpdatedBy("support.team");
        variantRepo.save(var5_ja);
    }

    private Set<String> createTagSet(String... tags) {
        Set<String> set = new HashSet<>();
        for (String tag : tags) {
            set.add(tag);
        }
        return set;
    }
}
