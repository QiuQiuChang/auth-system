package com.auth.config;

import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

/**
 * 启动时批量补齐 AI 工具箱的全部工具配置。
 *
 * <p>执行 classpath 下的 {@code seed-all-tools.sql}，该文件全部使用
 * {@code INSERT IGNORE}，依赖 {@code tool_config.slug} 的唯一约束实现幂等：
 * 已存在的工具会被自动跳过，不会重复插入，也不会修改/删除任何既有数据。
 *
 * <p>与 {@link ImageToolsInitializer}、{@link VideoToolsInitializer} 使用相同的
 * {@code CommandLineRunner} 机制，三者插入的 slug 互不重叠。
 */
@Component
@Order(100)
public class AllToolsInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AllToolsInitializer.class);
    private static final String SEED_SCRIPT = "seed-all-tools.sql";

    private final DataSource dataSource;

    public AllToolsInitializer(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(String... args) {
        ClassPathResource script = new ClassPathResource(SEED_SCRIPT);
        if (!script.exists()) {
            log.warn("工具种子脚本不存在，跳过初始化: {}", SEED_SCRIPT);
            return;
        }

        try {
            ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
            populator.addScript(script);
            // 语句以 ';' 分隔；INSERT IGNORE 已保证幂等，遇错不静默吞掉。
            populator.setSeparator(";");
            populator.setContinueOnError(false);
            populator.execute(dataSource);
            log.info("AI 工具箱种子脚本执行完成: {}", SEED_SCRIPT);
        } catch (Exception e) {
            // 初始化失败不应阻断应用启动，记录详细上下文供排查。
            log.error("执行 AI 工具箱种子脚本失败: {}", SEED_SCRIPT, e);
        }
    }
}
