# 612 班级纪念站

这是一个用 Astro 搭建的班级纪念网站，用来保存毕业后的班级记忆：时间线、照片墙、同学近况、综合试卷和留言墙。

## 功能

- 首页：班级纪念入口、导航和基础统计。
- 三年时间线：记录高中阶段的重要片段。
- 照片墙：按专题整理课堂日常、班级活动、毕业当天和随手抓拍。
- 如今的我们：展示同学卡片和个人近况页面。
- 综合试卷：把纪念试卷做成网页，并保留 Word 原卷下载。
- 留言墙：接入 Twikoo 后可在页面中留言。
- 全站搜索：通过 Typesense 搜索并筛选时间线、照片、文章和同学公开资料。
- PWA：支持添加到主屏幕，并离线访问站点外壳及已浏览的同源内容。
- SEO：默认生产构建保留可读正文，并生成 canonical、结构化数据、`robots.txt` 与站点地图，便于搜索引擎抓取。
- 可选字体保护：需要降低静态内容被直接复制的风险时，可单独执行受保护构建。

## 技术栈

- Astro 6
- TypeScript
- 原生 CSS
- Twikoo 评论系统

## 快速开始

```bash
npm install
npm run dev
```

本地开发服务启动后，按终端提示打开页面即可。

常用命令：

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建适合搜索引擎抓取的静态站点到 dist
npm run build:protected # 可选：构建带汉字字体混淆的版本
npm run preview  # 预览构建结果
npm run search:sync # 将公开内容同步到 Typesense
```

`npm run build` 会在 Astro 构建完成后生成带内容版本号的 Service Worker，并预缓存页面、样式、脚本、应用图标和首页主视觉。照片等大体积资源采用访问后缓存，第三方接口始终走网络。

`npm run build:protected` 会额外混淆 `dist` 页面中的汉字并生成按需裁剪的 WOFF2 字体。该模式会降低搜索引擎理解正文的能力，不适合需要 SEO 的正式部署。字体混淆不修改源码，也不能替代访问控制或版权保护。

## Typesense 全站搜索

复制 `.env.example` 中的配置到本地 `.env`、`.env.local` 或部署平台的环境变量。`npm run search:sync` 会自动读取这两个本地文件，且 `.env.local` 中的同名配置优先：

- `PUBLIC_TYPESENSE_*` 会进入浏览器，只能使用具有搜索权限的 Search-only Key。
- `TYPESENSE_ADMIN_API_KEY` 只用于同步索引，不能添加 `PUBLIC_` 前缀。

配置完成后直接执行，不需要在终端中逐个设置环境变量：

```bash
npm run search:key
npm run search:sync
npm run build
```

`npm run search:key` 使用 `TYPESENSE_ADMIN_API_KEY` 创建一个仅能搜索 `class_memories` 集合的只读密钥，并自动写入 `.env.local`。如果已经存在只读密钥，脚本会停止；需要轮换时使用 `npm run search:key -- --force`。

同步脚本会在集合不存在时创建 `class_memories`，然后批量更新现有搜索文档。部署流程应在内容更新后先执行同步，再构建和发布站点。

## 项目结构

```text
.
|-- public/
|   `-- assets/              # 静态图片、试卷附件等资源
|-- scripts/                 # GitHub Issue 自动更新数据脚本
|-- src/
|   |-- data/                # 站点内容数据
|   |   |-- site.ts          # 站点标题、导航、联系方式
|   |   |-- timeline.ts      # 时间线内容
|   |   |-- photos.ts        # 照片墙入口数据
|   |   |-- photo-topics/    # 各照片专题
|   |   |-- people.ts        # 同学资料
|   |   |-- exam.ts          # 综合试卷内容与评分配置
|   |   `-- messages.ts      # 留言墙文案与 Twikoo 配置
|   |-- layouts/             # 通用页面布局
|   |-- pages/               # 路由页面
|   `-- styles/              # 全局和页面样式
|-- astro.config.mjs
`-- package.json
```

## 内容维护

大部分网站内容都在 `src/data` 目录中维护。

- 修改站点名称、首页文案、导航和联系方式：编辑 `src/data/site.ts`
- 修改时间线：编辑 `src/data/timeline.ts`
- 修改照片墙专题：编辑 `src/data/photo-topics/*.ts`
- 修改同学资料：编辑 `src/data/people.ts`
- 修改试卷内容和答案：编辑 `src/data/exam.ts`
- 修改留言墙文案和 Twikoo 配置：编辑 `src/data/messages.ts`

新增静态资源时，放到 `public/assets` 下。页面中引用资源时使用以 `/assets/` 开头的路径，例如：

```ts
photo: "/assets/photos/example.jpg"
```

## 留言墙配置

留言墙使用 Twikoo。需要在本地或部署平台中配置环境变量：

```bash
PUBLIC_TWIKOO_ENV_ID=你的_Twikoo_envId
```

如果没有配置该变量，留言页会显示待配置提示，不会加载评论区。

## GitHub Issue 自动更新

仓库中包含用于收集内容更新的 Issue 模板和 GitHub Actions：

- `people-update`：根据 Issue 表单更新 `src/data/people.ts`
- `photo-update`：根据 Issue 表单更新对应的照片专题数据

提交或编辑对应 Issue 后，工作流会运行脚本并自动创建更新 PR，方便审核后合并。

## 构建与部署

执行：

```bash
npm run build
```

构建产物会生成到 `dist/`。这个项目是静态站点，可以部署到 GitHub Pages、Vercel、Netlify 或任意静态资源服务器。

部署前建议检查 `astro.config.mjs` 中的 `site` 字段，把它改成真实站点地址。
