package com.auth.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * 启动时补齐视频生成工具配置。
 */
@Component
public class VideoToolsInitializer implements CommandLineRunner {

    private static final String SLUG = "ai-video";
    private static final String INPUT_FIELDS = "["
            + "{\"name\":\"prompt\",\"label\":\"视频描述\",\"type\":\"textarea\",\"required\":true,"
            + "\"placeholder\":\"例如：夕阳下的海边，一位女孩慢慢走向镜头，电影感运镜\"},"
            + "{\"name\":\"duration\",\"label\":\"视频时长\",\"type\":\"select\",\"required\":false,"
            + "\"placeholder\":\"请选择\",\"options\":["
            + "{\"value\":\"5\",\"label\":\"5 秒\"},"
            + "{\"value\":\"10\",\"label\":\"10 秒（推荐）\"},"
            + "{\"value\":\"15\",\"label\":\"15 秒\"},"
            + "{\"value\":\"18\",\"label\":\"18 秒（最长）\"}"
            + "]}]";

    private final JdbcTemplate jdbcTemplate;

    public VideoToolsInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM tool_config WHERE slug = ?", Integer.class, SLUG);
        if (count == null || count == 0) {
            insertTool();
            return;
        }
        String inputFields = jdbcTemplate.queryForObject(
                "SELECT input_fields FROM tool_config WHERE slug = ?", String.class, SLUG);
        if (inputFields == null || !inputFields.contains("\"duration\"")) {
            jdbcTemplate.update(
                    "UPDATE tool_config SET input_fields = ?, updated_at = NOW() WHERE slug = ?",
                    INPUT_FIELDS, SLUG);
        }
    }

    private void insertTool() {
        jdbcTemplate.update(
                "INSERT INTO tool_config (name, slug, description, icon, category, prompt_template, input_fields, output_type, sort_order, status, created_at, updated_at) "
                        + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())",
                "AI 视频生成",
                SLUG,
                "输入画面描述，AI 自动生成短视频，支持选择生成时长",
                "VideoCameraOutlined",
                "创意设计",
                "请根据以下描述生成视频：\n【视频描述】{{prompt}}\n要求：画面自然连贯，运镜稳定，主体清晰。",
                INPUT_FIELDS,
                "video",
                12);
    }
}
