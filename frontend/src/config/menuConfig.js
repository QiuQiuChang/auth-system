import { HomeOutlined, ThunderboltOutlined } from '@ant-design/icons'

/**
 * 侧边栏菜单配置 — 新增模块只需在此添加一项
 * key: 唯一标识（与路由对应）
 * icon: Ant Design 图标组件
 * label: 菜单显示文字
 * path: 路由路径
 */
const menuConfig = [
  { key: 'home',  icon: HomeOutlined,       label: '首页',       path: '/home' },
  { key: 'tools', icon: ThunderboltOutlined, label: 'AI 工具箱',  path: '/tools' },
]

export default menuConfig
