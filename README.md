# QuartzYan.github.io

QuartzYan 的个人主页与技术博客。网站使用 Astro 构建，页面代码与文章内容分离：

- 本仓库只保存网站代码、样式和构建流程。
- 文章、图片和草稿保存在独立的 `QuartzNote` 仓库。
- 构建时只加载 `status: published` 的文章。
- 文章列表优先按可选的 `publishedAt` 精确发布时间倒序排列，未设置时回退到 `date`。
- 生成内容位于被 Git 忽略的目录，不在两个仓库之间复制维护。

## 本地开发

默认目录结构：

```text
sanshi_blog/
├── QuartzNote/
└── QuartzYan.github.io/
```

安装依赖并启动：

```bash
npm install
npm run dev
```

如果内容仓库不在默认位置：

```bash
CONTENT_DIR=/path/to/QuartzNote npm run dev
```

## 检查与构建

```bash
npm run check
npm run build
```

构建会执行以下步骤：

1. 读取 QuartzNote 的文章目录。
2. 校验必填元数据及重复 ID/slug。
3. 仅导入 `published` 文章。
4. 复制文章引用资源到构建目录。
5. 记录 QuartzNote commit。
6. 生成静态网站、RSS 和 Sitemap。

## Markdown 能力

- GitHub Flavored Markdown
- KaTeX 行内与块级公式
- Mermaid 图表
- Shiki 代码高亮和复制按钮
- 表格、任务列表和脚注
- 响应式图片与大图查看

## 部署

生产环境通过 GitHub Actions 构建并部署到 GitHub Pages。内容仓库设为私有后，
工作流使用权限仅限所需仓库的 GitHub App 短期令牌读取 QuartzNote。
