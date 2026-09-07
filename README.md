# report-cli · 汇报档案馆

用于**维护和展示汇报项目**的仓库。所有汇报均为独立、零依赖的纯前端 HTML 页面，整站托管于 **Cloudflare**（Workers Static Assets）。

- 仓库：git@github.com:Vernon308/report-cli.git
- 线上门户（根路径 `/`）：自动列出所有已登记的汇报项目，支持检索与标签筛选

## 目录结构

```
├── index.html        # 门户首页（项目索引，读取 projects.json）
├── projects.json     # 项目清单（门户的唯一数据源）
├── <slug>/           # 每个汇报项目一个目录
│   ├── index.html    #   项目入口（必须有）
│   └── assets/       #   图片等静态资源（相对路径引用）
├── scripts/new-report.mjs   # 新项目脚手架
├── wrangler.toml     # Cloudflare 静态资源配置（Workers Static Assets）
└── _headers          # 静态资源响应头（Workers Assets 支持）
```

## 新增一个汇报项目

```bash
npm run new -- q3-review "Q3 经营复盘" "三季度核心指标与行动项"
```

脚本会：创建 `q3-review/index.html` + `assets/` 模板，并把项目登记进 `projects.json`。

也可以纯手工：新建 `<slug>/index.html`，然后在 `projects.json` 顶部追加一条记录：

```json
{
  "id": "q3-review",
  "title": "Q3 经营复盘",
  "description": "一句话说明",
  "path": "/q3-review/",
  "date": "2026-09-07",
  "tags": ["经营", "复盘"]
}
```

> 约定：项目目录 slug 使用小写字母/数字/连字符；资源一律用相对路径引用，保证子路径下可直接访问。

## 本地预览

```bash
# 方式一：Cloudflare 官方（推荐，与线上一致）
npm install        # 首次，安装 wrangler
npm run dev        # http://localhost:8788

# 方式二：任意静态服务器
python3 -m http.server 8000   # http://localhost:8000
```

## 部署到 Cloudflare

本仓库是**零构建纯静态站点**，通过 Workers Static Assets 托管（`wrangler.toml` 中 `[assets] directory = "."`）。

### 方式 A：Git 集成（推荐，推送即发布）

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Import a repository**
2. 选择 `Vernon308/report-cli` 仓库
3. 构建设置保持默认即可：
   - Build command: *留空*（平台检测到 package.json 会自动跑 `bun install` 安装 wrangler，属正常）
   - Deploy command: `npx wrangler deploy`（默认）
4. 保存后，每次 push 到 `main` 都会自动发布，访问地址形如 `https://report-cli.<你的子域>.workers.dev`

> 注意：如果已建好的项目部署命令被改成了别的（例如 `npx wrangler pages deploy`），
> 在 **Settings → Build** 里把 Deploy command 恢复为 `npx wrangler deploy` 即可。

### 方式 B：命令行直传

```bash
npm install
npx wrangler login        # 首次授权
npm run deploy            # = npx wrangler deploy
```

### 上传内容控制

`wrangler deploy` 会把仓库根目录作为静态资源上传，以下内容由 `.assetsignore` 排除：
`.git`、`node_modules`、`scripts/`、`package.json`、`wrangler.toml` 等工程文件。
**`projects.json` 必须保留**（门户运行时要读取），不要加进 `.assetsignore`。

## 维护约定

### 项目规范

- 每个项目必须自包含：不依赖根目录资源、不依赖后端，断网仅 CDN 字体/图标可能降级
- 项目目录 slug 使用小写字母/数字/连字符（`^[a-z0-9][a-z0-9-]*$`），入口必须为 `index.html`
- 资源一律相对路径引用，保证 `/<slug>/` 子路径下可直接访问
- `projects.json` 按 `date` 倒序展示，新项目用 `npm run new` 或手动置顶追加
- 删除项目：移除目录 + 清单中对应记录即可

### 部署关键文件（勿删勿改）

以下文件是 Cloudflare 部署链路的一部分，**新增/删除项目时都不需要动它们**：

| 文件 | 作用 | 注意 |
|---|---|---|
| `wrangler.toml` | `[assets] directory = "."`，声明整仓为静态资源站点 | 不要加 `pages_build_output_dir`（那是旧 Pages 配置，会让 CI 的 `wrangler deploy` 报错） |
| `.assetsignore` | 控制上传时排除 `.git`、`node_modules`、工程文件 | **不要把 `projects.json` 加进去**，门户运行时要读取 |
| `_headers` | 静态资源安全响应头 | Workers Static Assets 原生支持 |
| `package.json` | 声明 wrangler 依赖，CI 会自动 `bun install` | 删除会导致 CI 找不到 wrangler |

### 部署链路约定

- CI 流程：push 到 `main` → Cloudflare 自动 `bun install` → `npx wrangler deploy` → 发布完成
- Cloudflare 项目 Settings → Build 里的 **Deploy command 必须保持 `npx wrangler deploy`**（默认值），不要改成 `npx wrangler pages deploy`
- 线上地址：`https://report-cli.<子域>.workers.dev`，项目页面为 `…/<slug>/`
- 本地验证部署配置改动：`npx wrangler deploy --dry-run`（无需登录，会列出被排除的文件）
