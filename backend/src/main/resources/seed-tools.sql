-- ==========================================
-- AI 工具引擎 - 预置工具数据
-- 在 MySQL 中执行此脚本初始化 3 个工具
-- ==========================================

USE auth_system;

-- 小红书文案生成
INSERT INTO tool_config (name, slug, description, icon, category, prompt_template, input_fields, output_type, sort_order, status, created_at, updated_at)
VALUES (
  '小红书文案生成',
  'xiaohongshu',
  '输入商品信息和卖点，自动生成 5 条种草文案，带热门标签和 emoji 点缀',
  'EditOutlined',
  '内容创作',
  '你是一个小红书资深种草博主。请根据以下信息生成 5 条小红书风格的推广文案：

【商品名称】{{name}}
【核心卖点】{{features}}
【目标人群】{{audience}}
【风格偏好】{{style}}

要求：
1. 每条文案 80-150 字，包含 emoji
2. 文案语气自然、可信，像真实用户体验分享
3. 每条末尾配 3-5 个热门标签
4. 避免过度营销感，强调使用场景和体验
5. 用序号 1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 分隔每条文案

请开始生成：',
  '[{"name":"name","label":"商品名称","type":"text","required":true,"placeholder":"例如：氨基酸洁面乳"},{"name":"features","label":"核心卖点","type":"textarea","required":true,"placeholder":"例如：温和不紧绷、适合敏感肌、泡沫丰富"},{"name":"audience","label":"目标人群","type":"text","required":false,"placeholder":"例如：学生党、上班族、宝妈"},{"name":"style","label":"风格偏好","type":"select","required":false,"placeholder":"请选择","options":[{"value":"日常分享","label":"日常分享"},{"value":"测评对比","label":"测评对比"},{"value":"好物推荐","label":"好物推荐"},{"value":"使用教程","label":"使用教程"}]}]',
  'text',
  1,
  1,
  NOW(),
  NOW()
);

-- AI 周报生成
INSERT INTO tool_config (name, slug, description, icon, category, prompt_template, input_fields, output_type, sort_order, status, created_at, updated_at)
VALUES (
  'AI 周报生成',
  'weekly-report',
  '输入本周工作关键词，自动生成结构化的周报，包含成果、问题和计划',
  'FileTextOutlined',
  '办公效率',
  '你是一个专业的工作周报撰写助手。请根据以下信息生成一份结构化的周报：

【本周关键词】{{keywords}}
【主要成果】{{achievements}}
【遇到的问题】{{problems}}
【下周计划】{{nextWeek}}

要求：
1. 使用专业但不生硬的语气
2. 结构包含：本周概览 → 重点工作 → 数据成果 → 问题与解决 → 下周计划
3. 用数据说话，量化成果
4. 适当使用项目符号和分段
5. 总字数 300-500 字

请开始生成：',
  '[{"name":"keywords","label":"本周关键词","type":"text","required":true,"placeholder":"例如：需求评审、接口联调、性能优化"},{"name":"achievements","label":"主要成果","type":"textarea","required":true,"placeholder":"例如：完成用户模块接口开发，通过单元测试覆盖率 85%"},{"name":"problems","label":"遇到的问题","type":"textarea","required":false,"placeholder":"例如：第三方 API 响应超时，已切换备用方案"},{"name":"nextWeek","label":"下周计划","type":"textarea","required":false,"placeholder":"例如：上线灰度环境，压测并发 500 QPS"}]',
  'text',
  2,
  1,
  NOW(),
  NOW()
);

-- 合同模板生成
INSERT INTO tool_config (name, slug, description, icon, category, prompt_template, input_fields, output_type, sort_order, status, created_at, updated_at)
VALUES (
  '合同模板生成',
  'contract-gen',
  '选择合同类型并填写关键信息，自动生成符合规范的合同草案',
  'FileProtectOutlined',
  '法律服务',
  '你是一个专业的法律合同起草助手。请根据以下信息生成一份合同草案：

【合同类型】{{type}}
【甲方名称】{{partyA}}
【乙方名称】{{partyB}}
【合同标的】{{subject}}
【合同金额】{{amount}}
【履行期限】{{deadline}}
【特殊条款】{{specialTerms}}

要求：
1. 使用规范的合同格式和法律术语
2. 结构包含：当事人信息 → 标的与价款 → 权利义务 → 违约责任 → 争议解决 → 签署栏
3. 在开头添加明确的免责声明：**本内容由 AI 生成，仅供参考，签署前请咨询专业律师**
4. 条款清晰明确，避免模糊表述
5. 以正式合同格式输出，条款按第X条编号

请开始生成：',
  '[{"name":"type","label":"合同类型","type":"select","required":true,"placeholder":"请选择","options":[{"value":"服务合同","label":"服务合同"},{"value":"买卖合同","label":"买卖合同"},{"value":"租赁合同","label":"租赁合同"},{"value":"合作协议","label":"合作协议"},{"value":"委托合同","label":"委托合同"}]},{"name":"partyA","label":"甲方名称","type":"text","required":true,"placeholder":"例如：XX科技有限公司"},{"name":"partyB","label":"乙方名称","type":"text","required":true,"placeholder":"例如：XX信息技术有限公司"},{"name":"subject","label":"合同标的","type":"textarea","required":true,"placeholder":"例如：乙方为甲方提供小程序开发及运维服务"},{"name":"amount","label":"合同金额","type":"text","required":true,"placeholder":"例如：人民币 50,000 元（大写：伍万元整）"},{"name":"deadline","label":"履行期限","type":"text","required":true,"placeholder":"例如：自合同签订之日起 90 个工作日"},{"name":"specialTerms","label":"特殊条款（选填）","type":"textarea","required":false,"placeholder":"其他需要约定的条款"}]',
  'text',
  3,
  1,
  NOW(),
  NOW()
);
