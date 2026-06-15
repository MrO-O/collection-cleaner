# collection-cleaner

collection-cleaner 是一个本地优先的收藏内容清理工具，用于管理网页、视频、文章、商品、课程、论文等收藏内容，帮助用户识别长期未处理的“吃灰”项目，并提醒用户处理、删除、归档或复盘。

当前仓库处于第一阶段：只交付可运行的前端项目骨架，不接入后端、AI API、登录、云同步或浏览器扩展。

## 安装

```bash
npm install
```

## 运行

```bash
npm run dev
```

## 构建

```bash
npm run build
```

## 测试

```bash
npm run test
```

## 代码检查

```bash
npm run lint
```

## 当前阶段完成内容

- 初始化 React + TypeScript + Vite 项目结构
- 配置 Tailwind CSS、React Router、Vitest、ESLint、Prettier
- 安装并预留 Dexie.js
- 创建 App shell、顶部标题区、桌面侧边导航和移动端底部导航
- 创建 Dashboard、CollectionList、ItemDetail、ImportPage、StatsPage、SettingsPage
- 使用假数据展示收藏项
- 创建 CollectionItem、ContentType、CollectionStatus、CollectionReason 类型
- 创建 dustScore 占位计算函数和最小单元测试

## TODO

- 设计 Dexie 本地数据库 schema 和迁移策略
- 实现收藏项新增、编辑、删除、归档和复盘流程
- 实现导入解析，包括书签、CSV、JSON 或粘贴链接
- 完善 dustScore 计算规则
- 增加更多页面级和组件级测试
