-- ==========================================
-- AI 工具增强包 - 基于 Agnes AI 能力
-- 新增工具：视频创作、代码辅助、办公效率、多模态理解
-- ==========================================

USE auth_system;

-- ==========================================
-- 视频创作类 (Video Generation)
-- ==========================================

-- 1. 产品宣传视频
INSERT INTO tool_config (name, slug, description, icon, category, prompt_template, input_fields, output_type, sort_order, status, created_at, updated_at)
VALUES (
  '产品宣传视频',
  'product-video',
  '输入产品信息，AI自动生成专业的产品宣传视频，适合社交媒体和电商平台',
  'VideoCameraOutlined',
  '视频创作',
  '你是一个专业的视频制作师。请根据以下信息生成产品宣传视频：
【产品名称】{{productName}}
【产品描述】{{description}}
【核心卖点】{{sellingPoints}}
【视频风格】{{style}}

要求：
1. 画面专业，突出产品特性
2. 节奏明快，适合短视频平台
3. 包含产品展示、使用场景和效果呈现
4. 视觉效果吸引人，符合目标受众审美
请生成视频内容。',
  '[{"name":"productName","label":"产品名称","type":"text","required":true,"placeholder":"例如：智能手表Pro"},{"name":"description","label":"产品描述","type":"textarea","required":true,"placeholder":"例如：支持心率监测、运动追踪、消息提醒的全天候健康管家"},{"name":"sellingPoints","label":"核心卖点","type":"textarea","required":true,"placeholder":"例如：续航7天、50米防水、24小时心率监测"},{"name":"style","label":"视频风格","type":"select","required":false,"options":[{"value":"科技感","label":"科技感"},{"value":"生活化","label":"生活化"},{"value":"时尚潮流","label":"时尚潮流"},{"value":"简约大气","label":"简约大气"}]}]',
  'video',
  20,
  1,
  NOW(),
  NOW()
);

-- 2. 短视频脚本生成
INSERT INTO tool_config (name, slug, description, icon, category, prompt_template, input_fields, output_type, sort_order, status, created_at, updated_at)
VALUES (
  '短视频脚本生成',
  'video-script',
  '输入主题和时长，AI自动生成抖音/快手风格的短视频脚本，包含分镜和文案',
  'FileTextOutlined',
  '视频创作',
  '你是一个资深的短视频编导。请根据以下信息生成短视频脚本：
【视频主题】{{topic}}
【视频时长】{{duration}}秒
【目标平台】{{platform}}
【内容风格】{{style}}

要求：
1. 前3秒必须抓住注意力（黄金3秒法则）
2. 结构清晰：开场hook → 主体内容 → 引导互动
3. 包含分镜说明、画面描述、文案台词、背景音乐建议
4. 语言简洁有力，适合口播
5. 结尾包含引导点赞、关注、评论的互动话术

请按以下格式输出：
【开场（0-3秒）】
画面：...
文案：...

【主体（4-{{duration-3}}秒）】
画面：...
文案：...

【结尾（最后3秒）】
画面：...
文案：...

【音乐建议】...',
  '[{"name":"topic","label":"视频主题","type":"text","required":true,"placeholder":"例如：5个职场新人必备技能"},{"name":"duration","label":"视频时长（秒）","type":"select","required":true,"options":[{"value":"15","label":"15秒（超短）"},{"value":"30","label":"30秒（常规）"},{"value":"60","label":"60秒（详细）"},{"value":"90","label":"90秒（深度）"}]},{"name":"platform","label":"目标平台","type":"select","required":false,"options":[{"value":"抖音","label":"抖音"},{"value":"快手","label":"快手"},{"value":"视频号","label":"视频号"},{"value":"小红书","label":"小红书"}]},{"name":"style","label":"内容风格","type":"select","required":false,"options":[{"value":"知识科普","label":"知识科普"},{"value":"剧情搞笑","label":"剧情搞笑"},{"value":"情感共鸣","label":"情感共鸣"},{"value":"实用教程","label":"实用教程"}]}]',
  'text',
  21,
  1,
  NOW(),
  NOW()
);

-- ==========================================
-- 代码辅助类 (Code Assistant)
-- ==========================================

-- 3. 代码注释生成
INSERT INTO tool_config (name, slug, description, icon, category, prompt_template, input_fields, output_type, sort_order, status, created_at, updated_at)
VALUES (
  '代码注释生成',
  'code-comment',
  '粘贴代码片段，AI自动生成详细的函数注释、行内注释和文档说明',
  'CodeOutlined',
  '开发工具',
  '你是一个资深的代码文档专家。请为以下代码生成专业的注释：

【编程语言】{{language}}
【代码片段】
```
{{code}}
```

要求：
1. 为每个函数/方法生成 JSDoc/Javadoc/Docstring 风格的文档注释
2. 说明参数类型、返回值、异常情况
3. 为复杂逻辑添加行内注释
4. 注释语言：{{commentLang}}
5. 保持原有代码缩进和格式
6. 注释简洁准确，避免废话

请输出带注释的完整代码。',
  '[{"name":"language","label":"编程语言","type":"select","required":true,"options":[{"value":"JavaScript","label":"JavaScript"},{"value":"TypeScript","label":"TypeScript"},{"value":"Python","label":"Python"},{"value":"Java","label":"Java"},{"value":"Go","label":"Go"},{"value":"C++","label":"C++"},{"value":"Rust","label":"Rust"}]},{"name":"code","label":"代码片段","type":"textarea","required":true,"placeholder":"粘贴需要添加注释的代码..."},{"name":"commentLang","label":"注释语言","type":"select","required":false,"options":[{"value":"中文","label":"中文"},{"value":"英文","label":"英文"}]}]',
  'text',
  30,
  1,
  NOW(),
  NOW()
);

-- 4. Bug分析助手
INSERT INTO tool_config (name, slug, description, icon, category, prompt_template, input_fields, output_type, sort_order, status, created_at, updated_at)
VALUES (
  'Bug分析助手',
  'bug-analyzer',
  '输入错误信息和代码上下文，AI帮你快速定位问题原因并提供修复方案',
  'BugOutlined',
  '开发工具',
  '你是一个资深的debug专家。请分析以下bug并提供解决方案：

【编程语言/框架】{{tech}}
【错误信息】
{{errorMessage}}

【相关代码】
```
{{code}}
```

【问题描述】{{description}}

请按以下格式输出：

## 问题分析
简要说明错误的根本原因

## 原因详解
深入解释为什么会出现这个问题

## 解决方案
提供 2-3 种可行的修复方法，标注推荐方案

## 修复代码
给出修复后的完整代码

## 预防措施
说明如何避免类似问题再次发生',
  '[{"name":"tech","label":"技术栈","type":"text","required":true,"placeholder":"例如：React + TypeScript / Spring Boot + MySQL"},{"name":"errorMessage","label":"错误信息","type":"textarea","required":true,"placeholder":"粘贴控制台错误信息或异常堆栈..."},{"name":"code","label":"相关代码","type":"textarea","required":false,"placeholder":"粘贴出错的代码片段..."},{"name":"description","label":"问题描述","type":"textarea","required":false,"placeholder":"描述什么操作会触发这个错误..."}]',
  'text',
  31,
  1,
  NOW(),
  NOW()
);

-- 5. 单元测试生成
INSERT INTO tool_config (name, slug, description, icon, category, prompt_template, input_fields, output_type, sort_order, status, created_at, updated_at)
VALUES (
  '单元测试生成',
  'unit-test',
  '输入函数代码，AI自动生成完整的单元测试用例，覆盖正常和异常场景',
  'ExperimentOutlined',
  '开发工具',
  '你是一个测试驱动开发（TDD）专家。请为以下代码生成完整的单元测试：

【编程语言】{{language}}
【测试框架】{{framework}}
【待测试代码】
```
{{code}}
```

要求：
1. 覆盖正常场景、边界条件、异常情况
2. 测试用例命名清晰（使用 should/when/given 模式）
3. 包含 setup、测试逻辑、断言、teardown
4. 添加必要的 mock 和 stub
5. 每个测试用例独立，可单独运行
6. 目标覆盖率：80%+

请输出完整的测试代码，包含导入语句和测试类/函数。',
  '[{"name":"language","label":"编程语言","type":"select","required":true,"options":[{"value":"JavaScript","label":"JavaScript"},{"value":"TypeScript","label":"TypeScript"},{"value":"Python","label":"Python"},{"value":"Java","label":"Java"},{"value":"Go","label":"Go"}]},{"name":"framework","label":"测试框架","type":"select","required":true,"options":[{"value":"Jest","label":"Jest"},{"value":"Vitest","label":"Vitest"},{"value":"Mocha","label":"Mocha"},{"value":"Pytest","label":"Pytest"},{"value":"JUnit","label":"JUnit"},{"value":"TestNG","label":"TestNG"},{"value":"Go testing","label":"Go testing"}]},{"name":"code","label":"待测试代码","type":"textarea","required":true,"placeholder":"粘贴需要生成测试的函数或类..."}]',
  'text',
  32,
  1,
  NOW(),
  NOW()
);

-- ==========================================
-- 办公效率类 (Office Productivity)
-- ==========================================

-- 6. 会议纪要生成
INSERT INTO tool_config (name, slug, description, icon, category, prompt_template, input_fields, output_type, sort_order, status, created_at, updated_at)
VALUES (
  '会议纪要生成',
  'meeting-minutes',
  '输入会议讨论内容，AI自动整理成结构化会议纪要，包含决议和待办事项',
  'ReconciliationOutlined',
  '办公效率',
  '你是一个专业的会议记录助手。请根据以下信息生成会议纪要：

【会议主题】{{topic}}
【参会人员】{{attendees}}
【会议时间】{{meetingTime}}
【讨论内容】
{{discussion}}

请按以下结构输出：

## 会议信息
- 主题：{{topic}}
- 时间：{{meetingTime}}
- 参会：{{attendees}}

## 会议议程
（根据讨论内容提取）

## 讨论要点
（分点总结关键讨论内容）

## 决议事项
（明确的决定和结论）

## 待办事项
（任务、责任人、截止时间）
- [ ] 任务1 - @责任人 - 截止日期
- [ ] 任务2 - @责任人 - 截止日期

## 下次会议
（如有约定）',
  '[{"name":"topic","label":"会议主题","type":"text","required":true,"placeholder":"例如：Q2产品需求评审会"},{"name":"attendees","label":"参会人员","type":"text","required":true,"placeholder":"例如：张三、李四、王五"},{"name":"meetingTime","label":"会议时间","type":"text","required":false,"placeholder":"例如：2024-01-15 14:00-15:30"},{"name":"discussion","label":"讨论内容","type":"textarea","required":true,"placeholder":"粘贴会议记录或讨论要点..."}]',
  'text',
  40,
  1,
  NOW(),
  NOW()
);

-- 7. 商务邮件撰写
INSERT INTO tool_config (name, slug, description, icon, category, prompt_template, input_fields, output_type, sort_order, status, created_at, updated_at)
VALUES (
  '商务邮件撰写',
  'business-email',
  '输入邮件要点，AI自动生成专业、得体的商务邮件，支持中英文',
  'MailOutlined',
  '办公效率',
  '你是一个商务沟通专家。请根据以下信息撰写商务邮件：

【邮件类型】{{emailType}}
【收件人】{{recipient}}
【邮件目的】{{purpose}}
【关键信息】{{keyPoints}}
【语言】{{language}}
【语气】{{tone}}

要求：
1. 开头称呼得体，结尾署名规范
2. 结构清晰：问候 → 正文 → 行动号召 → 结束语
3. 语言专业但不生硬，符合商务礼仪
4. 突出重点信息，逻辑清晰
5. 长度适中（150-300字）

请输出完整邮件内容。',
  '[{"name":"emailType","label":"邮件类型","type":"select","required":true,"options":[{"value":"合作邀请","label":"合作邀请"},{"value":"进度汇报","label":"进度汇报"},{"value":"问题反馈","label":"问题反馈"},{"value":"会议邀请","label":"会议邀请"},{"value":"感谢信","label":"感谢信"},{"value":"催办提醒","label":"催办提醒"}]},{"name":"recipient","label":"收件人","type":"text","required":true,"placeholder":"例如：王总、李经理"},{"name":"purpose","label":"邮件目的","type":"textarea","required":true,"placeholder":"例如：邀请参加新产品发布会"},{"name":"keyPoints","label":"关键信息","type":"textarea","required":true,"placeholder":"例如：时间、地点、议程等"},{"name":"language","label":"语言","type":"select","required":false,"options":[{"value":"中文","label":"中文"},{"value":"英文","label":"English"}]},{"name":"tone","label":"语气","type":"select","required":false,"options":[{"value":"正式","label":"正式"},{"value":"友好","label":"友好"},{"value":"紧急","label":"紧急"}]}]',
  'text',
  41,
  1,
  NOW(),
  NOW()
);

-- 8. PPT大纲生成
INSERT INTO tool_config (name, slug, description, icon, category, prompt_template, input_fields, output_type, sort_order, status, created_at, updated_at)
VALUES (
  'PPT大纲生成',
  'ppt-outline',
  '输入演讲主题和时长，AI自动生成结构化PPT大纲，包含每页标题和要点',
  'FileWordOutlined',
  '办公效率',
  '你是一个专业的演示文稿设计师。请根据以下信息生成PPT大纲：

【演讲主题】{{topic}}
【目标受众】{{audience}}
【演讲时长】{{duration}}分钟
【核心内容】{{content}}
【演讲目的】{{objective}}

要求：
1. 估算页数：{{duration}}分钟 ≈ {{duration}}/2 页内容页
2. 结构：封面 → 目录 → 正文（3-5个章节）→ 总结 → 结束页
3. 每页包含：页码、标题、3-5个要点、备注提示
4. 逻辑流畅，层次分明
5. 标注重点页面和关键数据

请按以下格式输出：

---
第1页：封面
- 主标题：{{topic}}
- 副标题：...
- 演讲人：...
- 日期：...

---
第2页：目录
1. ...
2. ...

---
第3页：章节标题
- 要点1：...
- 要点2：...
[备注] ...

（以此类推）',
  '[{"name":"topic","label":"演讲主题","type":"text","required":true,"placeholder":"例如：2024年度营销策略规划"},{"name":"audience","label":"目标受众","type":"text","required":true,"placeholder":"例如：公司管理层、市场部同事"},{"name":"duration","label":"演讲时长（分钟）","type":"select","required":true,"options":[{"value":"5","label":"5分钟（快速汇报）"},{"value":"10","label":"10分钟（简短分享）"},{"value":"20","label":"20分钟（标准演讲）"},{"value":"30","label":"30分钟（深度讲解）"},{"value":"45","label":"45分钟（培训课程）"}]},{"name":"content","label":"核心内容","type":"textarea","required":true,"placeholder":"列出需要讲解的主要内容和数据..."},{"name":"objective","label":"演讲目的","type":"select","required":false,"options":[{"value":"汇报总结","label":"汇报总结"},{"value":"方案提案","label":"方案提案"},{"value":"知识分享","label":"知识分享"},{"value":"产品介绍","label":"产品介绍"}]}]',
  'text',
  42,
  1,
  NOW(),
  NOW()
);

-- ==========================================
-- 内容创作类 (Content Creation)
-- ==========================================

-- 9. AI文章续写
INSERT INTO tool_config (name, slug, description, icon, category, prompt_template, input_fields, output_type, sort_order, status, created_at, updated_at)
VALUES (
  'AI文章续写',
  'article-continue',
  '输入文章开头或大纲，AI智能续写，保持风格一致，逻辑连贯',
  'FormOutlined',
  '内容创作',
  '你是一个专业的内容创作者。请根据以下信息续写文章：

【文章主题】{{topic}}
【已有内容】
{{existingContent}}

【续写方向】{{direction}}
【目标字数】{{wordCount}}字
【写作风格】{{style}}

要求：
1. 延续已有内容的语气和风格
2. 逻辑连贯，过渡自然
3. 内容充实，避免空洞
4. 结构清晰，分段合理
5. 如果已有内容是大纲，请展开详细论述

请开始续写：',
  '[{"name":"topic","label":"文章主题","type":"text","required":true,"placeholder":"例如：如何提高团队协作效率"},{"name":"existingContent","label":"已有内容","type":"textarea","required":true,"placeholder":"粘贴文章开头或大纲..."},{"name":"direction","label":"续写方向","type":"textarea","required":false,"placeholder":"例如：重点讲解工具使用技巧"},{"name":"wordCount","label":"目标字数","type":"select","required":false,"options":[{"value":"500","label":"500字（简短）"},{"value":"1000","label":"1000字（标准）"},{"value":"2000","label":"2000字（详细）"},{"value":"3000","label":"3000字（深度）"}]},{"name":"style","label":"写作风格","type":"select","required":false,"options":[{"value":"专业严谨","label":"专业严谨"},{"value":"轻松幽默","label":"轻松幽默"},{"value":"故事叙述","label":"故事叙述"},{"value":"干货实用","label":"干货实用"}]}]',
  'text',
  50,
  1,
  NOW(),
  NOW()
);

-- 10. 内容摘要提取
INSERT INTO tool_config (name, slug, description, icon, category, prompt_template, input_fields, output_type, sort_order, status, created_at, updated_at)
VALUES (
  '内容摘要提取',
  'content-summary',
  '输入长文本，AI自动提取核心观点和关键信息，生成精简摘要',
  'ReadOutlined',
  '内容创作',
  '你是一个专业的信息提炼专家。请为以下内容生成摘要：

【原始内容】
{{content}}

【摘要类型】{{summaryType}}
【目标长度】{{length}}

请按以下要求生成摘要：
1. 提取核心观点和关键信息
2. 保持原意，不添加主观判断
3. 语言简洁，逻辑清晰
4. 适当使用分点列举
5. 长度控制在{{length}}以内

请输出摘要内容。',
  '[{"name":"content","label":"原始内容","type":"textarea","required":true,"placeholder":"粘贴需要总结的文章、报告或会议记录..."},{"name":"summaryType","label":"摘要类型","type":"select","required":false,"options":[{"value":"要点提炼","label":"要点提炼"},{"value":"段落缩写","label":"段落缩写"},{"value":"一句话总结","label":"一句话总结"},{"value":"分层摘要","label":"分层摘要"}]},{"name":"length","label":"目标长度","type":"select","required":false,"options":[{"value":"50字以内","label":"50字（超短）"},{"value":"100字左右","label":"100字（简短）"},{"value":"200字左右","label":"200字（标准）"},{"value":"500字左右","label":"500字（详细）"}]}]',
  'text',
  51,
  1,
  NOW(),
  NOW()
);

-- ==========================================
-- 创意设计类 (Creative Design)
-- ==========================================

-- 11. Logo设计生成
INSERT INTO tool_config (name, slug, description, icon, category, prompt_template, input_fields, output_type, sort_order, status, created_at, updated_at)
VALUES (
  'Logo设计生成',
  'logo-design',
  '输入品牌信息和设计风格，AI自动生成专业Logo，支持多种样式',
  'BgColorsOutlined',
  '创意设计',
  '你是一个专业的品牌设计师。请根据以下信息设计Logo：

【品牌名称】{{brandName}}
【品牌定位】{{positioning}}
【行业领域】{{industry}}
【设计风格】{{style}}
【色彩倾向】{{color}}
【图形元素】{{elements}}

要求：
1. 设计简洁，识别度高
2. 适合多场景使用（名片、网站、APP）
3. 色彩搭配专业，符合品牌调性
4. 图形与品牌理念契合
5. 可以是图标型、字母型或组合型Logo

请生成Logo图片。',
  '[{"name":"brandName","label":"品牌名称","type":"text","required":true,"placeholder":"例如：云端科技"},{"name":"positioning","label":"品牌定位","type":"text","required":true,"placeholder":"例如：专注企业级云计算服务"},{"name":"industry","label":"行业领域","type":"select","required":true,"options":[{"value":"科技互联网","label":"科技互联网"},{"value":"教育培训","label":"教育培训"},{"value":"餐饮美食","label":"餐饮美食"},{"value":"美容时尚","label":"美容时尚"},{"value":"金融财务","label":"金融财务"},{"value":"医疗健康","label":"医疗健康"},{"value":"文化创意","label":"文化创意"}]},{"name":"style","label":"设计风格","type":"select","required":false,"options":[{"value":"现代简约","label":"现代简约"},{"value":"科技未来","label":"科技未来"},{"value":"传统经典","label":"传统经典"},{"value":"活力年轻","label":"活力年轻"},{"value":"高端奢华","label":"高端奢华"}]},{"name":"color","label":"色彩倾向","type":"text","required":false,"placeholder":"例如：蓝色科技感、绿色环保、暖色温馨"},{"name":"elements","label":"图形元素","type":"text","required":false,"placeholder":"例如：云朵、数据、连接"}]',
  'image',
  60,
  1,
  NOW(),
  NOW()
);

-- 12. 社交媒体配图
INSERT INTO tool_config (name, slug, description, icon, category, prompt_template, input_fields, output_type, sort_order, status, created_at, updated_at)
VALUES (
  '社交媒体配图',
  'social-media-image',
  '输入文案内容，AI自动生成适合微信、微博、小红书的配图',
  'PictureOutlined',
  '创意设计',
  '你是一个社交媒体视觉设计师。请根据以下信息生成配图：

【平台】{{platform}}
【文案内容】{{caption}}
【图片主题】{{theme}}
【设计风格】{{style}}
【色调】{{colorTone}}

要求：
1. 尺寸符合平台规范（{{platform}}）
2. 视觉冲击力强，吸引眼球
3. 文字和图片比例合理
4. 色彩协调，符合主题氛围
5. 适合移动端查看

请生成配图。',
  '[{"name":"platform","label":"目标平台","type":"select","required":true,"options":[{"value":"微信朋友圈","label":"微信朋友圈 (1:1)"},{"value":"微博","label":"微博 (16:9)"},{"value":"小红书","label":"小红书 (3:4)"},{"value":"抖音","label":"抖音 (9:16)"},{"value":"Instagram","label":"Instagram (1:1)"}]},{"name":"caption","label":"文案内容","type":"textarea","required":true,"placeholder":"输入要配图的文案..."},{"name":"theme","label":"图片主题","type":"text","required":true,"placeholder":"例如：早安问候、节日祝福、产品推广"},{"name":"style","label":"设计风格","type":"select","required":false,"options":[{"value":"小清新","label":"小清新"},{"value":"商务专业","label":"商务专业"},{"value":"可爱卡通","label":"可爱卡通"},{"value":"复古怀旧","label":"复古怀旧"},{"value":"极简主义","label":"极简主义"}]},{"name":"colorTone","label":"色调","type":"select","required":false,"options":[{"value":"暖色系","label":"暖色系"},{"value":"冷色系","label":"冷色系"},{"value":"黑白灰","label":"黑白灰"},{"value":"马卡龙色","label":"马卡龙色"},{"value":"高饱和","label":"高饱和"}]}]',
  'image',
  61,
  1,
  NOW(),
  NOW()
);

-- ==========================================
-- 智能分析类 (Data Analytics)
-- ==========================================

-- 13. 数据洞察分析
INSERT INTO tool_config (name, slug, description, icon, category, prompt_template, input_fields, output_type, sort_order, status, created_at, updated_at)
VALUES (
  '数据洞察分析',
  'data-insight',
  '粘贴业务数据或指标，AI归纳趋势、定位异常并给出结论建议',
  'LineChartOutlined',
  '智能分析',
  '你是一位数据分析专家。请分析以下数据并输出洞察：

【分析目标】{{goal}}
【数据内容】
{{data}}

【业务背景】{{context}}

要求：
1. 概述整体趋势与关键数字
2. 指出异常点或值得关注的变化
3. 推断可能原因（标注为推测）
4. 给出可执行的建议
5. 不要编造数据中不存在的数字

请按以下格式输出：

## 数据概览
（整体趋势描述）

## 关键发现
1. ...
2. ...

## 异常分析
（如有异常数据点）

## 可能原因
（推测性分析，需标注）

## 行动建议
1. ...
2. ...',
  '[{"name":"goal","label":"分析目标","type":"select","required":true,"options":[{"value":"趋势总结","label":"趋势总结"},{"value":"异常定位","label":"异常定位"},{"value":"对比分析","label":"对比分析"},{"value":"归因推断","label":"归因推断"}]},{"name":"data","label":"数据内容","type":"textarea","required":true,"placeholder":"粘贴各月销售额、留存率、转化率等业务指标数据"},{"name":"context","label":"业务背景","type":"textarea","required":false,"placeholder":"例如：Q2上线了新会员体系、7月进行了大促活动"}]',
  'text',
  70,
  1,
  NOW(),
  NOW()
);
