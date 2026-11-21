package com.auth.repository;

import com.auth.entity.ToolConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ToolConfigRepository extends JpaRepository<ToolConfig, Long> {

    Optional<ToolConfig> findBySlug(String slug);

    List<ToolConfig> findByStatusOrderBySortOrderAsc(Integer status);

    List<ToolConfig> findByStatusAndCategoryOrderBySortOrderAsc(Integer status, String category);
}
