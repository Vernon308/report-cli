#!/usr/bin/env node
/**
 * 新建汇报项目脚手架
 * 用法: npm run new -- <slug> ["标题"] ["描述"]
 * 示例: npm run new -- q3-review "Q3 经营复盘" "三季度核心指标与行动项"
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [slug, title, description = ""] = process.argv.slice(2);

if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  console.error("✗ 请提供合法 slug（小写字母/数字/连字符，字母开头），如: npm run new -- q3-review \"Q3 经营复盘\"");
  process.exit(1);
}
const dir = path.join(root, slug);
if (fs.existsSync(dir)) {
  console.error(`✗ 目录已存在: ${slug}/`);
  process.exit(1);
}

const pageTitle = title || slug;
const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${pageTitle}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;900&family=Noto+Serif+SC:wght@700;900&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Noto Sans SC',sans-serif;color:#1c1a17;background:#f6f4ee;line-height:1.75;}
  main{max-width:880px;margin:0 auto;padding:80px 24px 120px;}
  .kicker{font-size:12px;letter-spacing:.3em;color:#c13b22;text-transform:uppercase;margin-bottom:16px;}
  h1{font-family:'Noto Serif SC',serif;font-weight:900;font-size:clamp(34px,6vw,56px);line-height:1.2;}
  .meta{margin-top:14px;font-size:13px;color:#8a8478;}
  section{margin-top:56px;}
  h2{font-family:'Noto Serif SC',serif;font-size:24px;margin-bottom:14px;padding-bottom:10px;border-bottom:2px solid #1c1a17;}
  p{margin-bottom:12px;color:#4a463e;}
</style>
</head>
<body>
<main>
  <div class="kicker">Report · ${new Date().toISOString().slice(0, 10)}</div>
  <h1>${pageTitle}</h1>
  <div class="meta">汇报人 · 日期 · 版本 v1.0</div>
  <section>
    <h2>一、概述</h2>
    <p>在这里撰写正文。这是一个纯静态页面，可自由扩展样式、图表与交互。</p>
  </section>
</main>
</body>
</html>
`;

fs.mkdirSync(path.join(dir, "assets"), { recursive: true });
fs.writeFileSync(path.join(dir, "index.html"), html);

// 登记到 projects.json
const manifestPath = path.join(root, "projects.json");
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : [];
manifest.unshift({
  id: slug,
  title: pageTitle,
  description,
  path: `/${slug}/`,
  date: new Date().toISOString().slice(0, 10),
  tags: []
});
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

console.log(`✓ 已创建 ${slug}/index.html（含 assets/ 目录）`);
console.log(`✓ 已登记 projects.json（记得补充 description 与 tags）`);
console.log(`  本地预览: npm run dev  →  http://localhost:8788/${slug}/`);
