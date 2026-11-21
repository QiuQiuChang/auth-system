package com.auth.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * 启动时自动插入图片生成工具配置（如不存在则新增）
 */
@Component
public class ImageToolsInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public ImageToolsInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        // AI 海报设计
        upsertTool(
            "AI 海报设计", "poster-gen",
            "输入产品信息和风格，AI自动生成宣传海报图，支持多种尺寸和风格",
            "PictureOutlined", "创意设计",
            "你是一个专业的商业海报设计师。请根据以下信息设计海报画面：\n" +
            "【产品/主题】{{name}}\n【核心信息】{{content}}\n【设计风格】{{style}}\n【目标受众】{{audience}}\n" +
            "要求：画面专业有视觉冲击力，信息层级清晰，色彩搭配符合品牌调性。请生成海报图片。",
            "[{\"name\":\"name\",\"label\":\"产品/主题\",\"type\":\"text\",\"required\":true,\"placeholder\":\"例如：618年中大促\"}," +
            "{\"name\":\"content\",\"label\":\"核心信息\",\"type\":\"textarea\",\"required\":true,\"placeholder\":\"例如：全场低至5折\"}," +
            "{\"name\":\"style\",\"label\":\"设计风格\",\"type\":\"select\",\"required\":false,\"options\":[" +
            "{\"value\":\"简约现代\",\"label\":\"简约现代\"},{\"value\":\"国潮中国风\",\"label\":\"国潮中国风\"}," +
            "{\"value\":\"科技感\",\"label\":\"科技感\"},{\"value\":\"可爱卡通风\",\"label\":\"可爱卡通风\"}," +
            "{\"value\":\"高端奢华\",\"label\":\"高端奢华\"}]}," +
            "{\"name\":\"audience\",\"label\":\"目标受众\",\"type\":\"text\",\"required\":false,\"placeholder\":\"例如：25-35岁职场女性\"}]",
            "image", 9
        );

        // AI 插画生成
        upsertTool(
            "AI 插画生成", "illustration-gen",
            "输入主题和风格描述，AI自动生成精美插画，适合文章配图、社媒封面",
            "PictureOutlined", "创意设计",
            "你是一个专业的插画师。请根据以下需求生成插画：\n" +
            "【插画主题】{{topic}}\n【画面描述】{{description}}\n【风格偏好】{{style}}\n【色彩倾向】{{color}}\n" +
            "要求：画面精美细腻，构图合理主体突出，风格统一色彩和谐，适合配图或封面。请生成插画图片。",
            "[{\"name\":\"topic\",\"label\":\"插画主题\",\"type\":\"text\",\"required\":true,\"placeholder\":\"例如：夏日海滩度假\"}," +
            "{\"name\":\"description\",\"label\":\"画面描述\",\"type\":\"textarea\",\"required\":true,\"placeholder\":\"例如：阳光沙滩上，女孩在椰子树下看书\"}," +
            "{\"name\":\"style\",\"label\":\"风格偏好\",\"type\":\"select\",\"required\":false,\"options\":[" +
            "{\"value\":\"扁平插画\",\"label\":\"扁平插画\"},{\"value\":\"水彩手绘\",\"label\":\"水彩手绘\"}," +
            "{\"value\":\"3D渲染\",\"label\":\"3D渲染\"},{\"value\":\"日系动漫\",\"label\":\"日系动漫\"}," +
            "{\"value\":\"写实风格\",\"label\":\"写实风格\"}]}," +
            "{\"name\":\"color\",\"label\":\"色彩倾向\",\"type\":\"text\",\"required\":false,\"placeholder\":\"例如：暖色调、小清新\"}]",
            "image", 10
        );

        // AI 产品图生成
        upsertTool(
            "AI 产品图生成", "product-image",
            "输入产品描述，AI自动生成白底或场景化产品展示图",
            "PictureOutlined", "创意设计",
            "你是一个专业的产品摄影师。请根据以下信息生成产品展示图：\n" +
            "【产品名称】{{name}}\n【产品描述】{{description}}\n【展示风格】{{style}}\n【背景要求】{{background}}\n" +
            "要求：产品主体清晰突出，灯光专业质感高级，构图符合电商展示标准，背景干净。请生成产品展示图。",
            "[{\"name\":\"name\",\"label\":\"产品名称\",\"type\":\"text\",\"required\":true,\"placeholder\":\"例如：无线蓝牙耳机\"}," +
            "{\"name\":\"description\",\"label\":\"产品描述\",\"type\":\"textarea\",\"required\":true,\"placeholder\":\"例如：白色磨砂质感，入耳式设计\"}," +
            "{\"name\":\"style\",\"label\":\"展示风格\",\"type\":\"select\",\"required\":false,\"options\":[" +
            "{\"value\":\"白底棚拍\",\"label\":\"白底棚拍\"},{\"value\":\"场景展示\",\"label\":\"场景展示\"}," +
            "{\"value\":\"悬浮特写\",\"label\":\"悬浮特写\"},{\"value\":\"生活方式\",\"label\":\"生活方式\"}]}," +
            "{\"name\":\"background\",\"label\":\"背景要求\",\"type\":\"text\",\"required\":false,\"placeholder\":\"例如：纯白背景、办公桌面\"}]",
            "image", 11
        );
    }

    private void upsertTool(String name, String slug, String description, String icon,
                            String category, String promptTemplate, String inputFields,
                            String outputType, int sortOrder) {
        int count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM tool_config WHERE slug = ?", Integer.class, slug);
        if (count == 0) {
            jdbcTemplate.update(
                "INSERT INTO tool_config (name, slug, description, icon, category, prompt_template, input_fields, output_type, sort_order, status, created_at, updated_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())",
                name, slug, description, icon, category, promptTemplate, inputFields, outputType, sortOrder);
        }
    }
}
