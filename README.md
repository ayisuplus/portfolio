# 作品索引

一个静态单页：把 `/mnt/e/projects` 下的作品按类型整理成可点击的索引，每条都标注真实阶段。

- 线上：https://lingerpurplefall.com/ （Cloudflare Pages，主入口）
- 镜像：https://ayisuplus.github.io/portfolio/ （GitHub Pages）
- 数据：`data/works.json`（改一行就更新一张卡片，页面本身不写死内容）
- 部署：Cloudflare Pages 项目 `lingerpurplefall`（主）+ GitHub Pages `main` 根目录（镜像）
- 自定义域：`lingerpurplefall.com` 与 `www` 均为 CNAME → `lingerpurplefall.pages.dev`（proxied）

## 结构

```
index.html          骨架：导航、首屏、三个容器（筛选 / 网格 / 未公开清单）
assets/style.css    设计令牌与卡片样式，无构建步骤
assets/app.js       读 works.json → 渲染卡片 → 分类筛选
data/works.json     唯一数据源：site / categories / works / unpublished
assets/covers/      有真实截图的卡片用图，其余用排版封面（序号 + 分类色相）
```

## 本地预览

直接双击 `index.html` 会被浏览器的跨域策略拦住（`fetch` 读不了本地 JSON），起个静态服务器：

```bash
cd portfolio && python3 -m http.server 8089
# 打开 http://127.0.0.1:8089/
```

加 `?still=1` 关掉入场动画与数字滚动，方便截图。

## 加一件作品

在 `data/works.json` 的 `works` 里追加一条，字段：

| 字段 | 说明 |
| --- | --- |
| `id` | 唯一标识 |
| `title` / `subtitle` | 标题与副标题 |
| `cat` | `agents` / `systems` / `research` / `film` / `automation` |
| `status` | 当前阶段，会同时决定卡片指示灯颜色 |
| `stack` | 技术标签数组 |
| `summary` | 两到三句：做了什么、关键数字、边界在哪 |
| `links` | `[{label, url}]`，第一条是卡片点击目标 |
| `repo` | `owner/name`，有值才算「公开仓库」并计入统计 |
| `private` | 无公开入口时为 `true`，卡片不可点 |
| `cover` | 可选，相对路径的截图 |

没有公开入口的作品不要塞进 `works`，放进 `unpublished`（只有标题与原因）。

## 版权

页面代码 MIT。作品正文、图片与设定归作者，转载前请先问。

---

> 页面数据与 `data/works.json` 同步；作品本身的仓库见各卡片。
