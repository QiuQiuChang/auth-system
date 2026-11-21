-- 7个新工具 - 避免重复
USE auth_system;

-- 1. 商务邮件撰写
INSERT INTO tool_config (name, slug, description, icon, category, prompt_template, input_fields, output_type, sort_order, status, created_at, updated_at)
VALUES ('商务邮件撰写','business-email','输入邮件要点，AI自动生成专业、得体的商务邮件，支持中英文','MailOutlined','办公效率','你是一个商务沟通专家。请根据以下信息撰写商务邮件：\n\n【邮件类型】{{emailType}}\n【收件人】{{recipient}}\n【邮件目的】{{purpose}}\n【关键信息】{{keyPoints}}\n【语言】{{language}}\n【语气】{{tone}}\n\n要求：\n1. 开头称呼得体，结尾署名规范\n2. 结构清晰：问候 → 正文 → 行动号召 → 结束语\n3. 语言专业但不生硬，符合商务礼仪\n4. 突出重点信息，逻辑清晰\n5. 长度适中（150-300字）\n\n请输出完整邮件内容。','[{"name":"emailType","label":"邮件类型","type":"select","required":true,"options":[{"value":"合作邀请","label":"合作邀请"},{"value":"进度汇报","label":"进度汇报"},{"value":"问题反馈","label":"问题反馈"},{"value":"会议邀请","label":"会议邀请"},{"value":"感谢信","label":"感谢信"},{"value":"催办提醒","label":"催办提醒"}]},{"name":"recipient","label":"收件人","type":"text","required":true,"placeholder":"例如：王总、李经理"},{"name":"purpose","label":"邮件目的","type":"textarea","required":true,"placeholder":"例如：邀请参加新产品发布会"},{"name":"keyPoints","label":"关键信息","type":"textarea","required":true,"placeholder":"例如：时间、地点、议程等"},{"name":"language","label":"语言","type":"select","required":false,"options":[{"value":"中文","label":"中文"},{"value":"英文","label":"English"}]},{"name":"tone","label":"语气","type":"select","required":false,"options":[{"value":"正式","label":"正式"},{"value":"友好","label":"友好"},{"value":"紧急","label":"紧急"}]}]','text',41,1,NOW(),NOW());

-- 2. PPT大纲生成
INSERT INTO tool_config (name, slug, description, icon, category, prompt_template, input_fields, output_type, sort_order, status, created_at, updated_at)
VALUES ('PPT大纲生成','ppt-outline','输入演讲主题和时长，AI自动生成结构化PPT大纲','FileWordOutlined','办公效率','你是一个专业的演示文稿设计师。请根据以下信息生成PPT大纲：\n\n【演讲主题】{{topic}}\n【目标受众】{{audience}}\n【演讲时长】{{duration}}分钟\n【核心内容】{{content}}\n\n要求：\n1. 估算页数\n2. 结构：封面 → 目录 → 正文 → 总结\n3. 每页包含标题和要点\n4. 逻辑流畅\n\n请输出PPT大纲。','[{"name":"topic","label":"演讲主题","type":"text","required":true,"placeholder":"例如：2024年度营销策略"},{"name":"audience","label":"目标受众","type":"text","required":true,"placeholder":"例如：管理层"},{"name":"duration","label":"时长","type":"select","required":true,"options":[{"value":"10","label":"10分钟"},{"value":"20","label":"20分钟"},{"value":"30","label":"30分钟"}]},{"name":"content","label":"核心内容","type":"textarea","required":true,"placeholder":"列出主要内容"}]','text',42,1,NOW(),NOW());

-- 3. AI文章续写
INSERT INTO tool_config (name, slug, description, icon, category, prompt_template, input_fields, output_type, sort_order, status, created_at, updated_at)
VALUES ('AI文章续写','article-continue','输入文章开头或大纲，AI智能续写','FormOutlined','内容创作','你是内容创作者。请续写文章：\n\n【主题】{{topic}}\n【已有内容】{{existingContent}}\n【目标字数】{{wordCount}}字\n\n要求：保持风格一致，逻辑连贯。','[{"name":"topic","label":"主题","type":"text","required":true},{"name":"existingContent","label":"已有内容","type":"textarea","required":true},{"name":"wordCount","label":"字数","type":"select","required":false,"options":[{"value":"500","label":"500字"},{"value":"1000","label":"1000字"}]}]','text',50,1,NOW(),NOW());

-- 4. 内容摘要提取
INSERT INTO tool_config (name, slug, description, icon, category, prompt_template, input_fields, output_type, sort_order, status, created_at, updated_at)
VALUES ('内容摘要提取','content-summary','输入长文本，AI提取核心观点','ReadOutlined','内容创作','你是信息提炼专家。请生成摘要：\n\n【内容】{{content}}\n【类型】{{summaryType}}\n\n要求：简洁准确。','[{"name":"content","label":"原始内容","type":"textarea","required":true},{"name":"summaryType","label":"类型","type":"select","required":false,"options":[{"value":"要点提炼","label":"要点提炼"},{"value":"一句话总结","label":"一句话"}]}]','text',51,1,NOW(),NOW());

-- 5. Logo设计生成
INSERT INTO tool_config (name, slug, description, icon, category, prompt_template, input_fields, output_type, sort_order, status, created_at, updated_at)
VALUES ('Logo设计生成','logo-design','输入品牌信息，AI生成专业Logo','BgColorsOutlined','创意设计','你是品牌设计师。请设计Logo：\n\n【品牌】{{brandName}}\n【定位】{{positioning}}\n【行业】{{industry}}\n\n要求：简洁、识别度高。','[{"name":"brandName","label":"品牌名","type":"text","required":true},{"name":"positioning","label":"品牌定位","type":"text","required":true},{"name":"industry","label":"行业","type":"select","required":true,"options":[{"value":"科技","label":"科技"},{"value":"教育","label":"教育"}]}]','image',60,1,NOW(),NOW());

-- 6. 社交媒体配图
INSERT INTO tool_config (name, slug, description, icon, category, prompt_template, input_fields, output_type, sort_order, status, created_at, updated_at)
VALUES ('社交媒体配图','social-media-image','生成适合各平台的配图','PictureOutlined','创意设计','你是视觉设计师。请生成配图：\n\n【平台】{{platform}}\n【文案】{{caption}}\n【主题】{{theme}}\n\n要求：吸引眼球。','[{"name":"platform","label":"平台","type":"select","required":true,"options":[{"value":"微信","label":"微信"},{"value":"微博","label":"微博"}]},{"name":"caption","label":"文案","type":"textarea","required":true},{"name":"theme","label":"主题","type":"text","required":true}]','image',61,1,NOW(),NOW());

-- 7. 数据洞察分析
INSERT INTO tool_config (name, slug, description, icon, category, prompt_template, input_fields, output_type, sort_order, status, created_at, updated_at)
VALUES ('数据洞察分析','data-insight','粘贴数据，AI归纳趋势并给建议','LineChartOutlined','智能分析','你是数据分析专家。请分析：\n\n【目标】{{goal}}\n【数据】{{data}}\n【背景】{{context}}\n\n要求：\n1. 概述趋势\n2. 指出异常\n3. 给出建议','[{"name":"goal","label":"分析目标","type":"select","required":true,"options":[{"value":"趋势总结","label":"趋势总结"},{"value":"异常定位","label":"异常定位"}]},{"name":"data","label":"数据内容","type":"textarea","required":true},{"name":"context","label":"业务背景","type":"textarea","required":false}]','text',70,1,NOW(),NOW());
