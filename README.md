# 数学赛车 math-rocket

给 6 岁左右孩子的加减法练习小游戏：赛车主题、一题一反馈、题目每次随机生成但难度分五档并自适应、答错有分步动画讲解。纯前端静态站，部署在 GitHub Pages，平板横屏 / 手机竖屏都能玩，可装到桌面离线用（PWA）。

线上地址：https://dvxiaofan.github.io/math-rocket/ （仓库 Settings → Pages → Source 选 **GitHub Actions** 后，push main 自动部署）

## 怎么玩

- 首页「开始比赛」→ 一局默认 10 题（可设 15/20）→ 结算页看星级、用时、连对、错题。
- 作答方式：四选一（默认）或数字键盘，在设置里切换。
- 难度「赛道 1–5」：十以内加 / 十以内减 / 十以内混合 / 二十以内不进退位 / 二十以内进退位。默认自动升降（连对 3 升、连错 2 降），也可锁定。
- 答错会弹「看看怎么算」：摆点、划掉、凑十、退位四种动画，一句话字幕；结算页错题也能点开看。
- 设置入口要**长按**，防孩子误触。
- 「打印」页用同一个生成器出 A4 练习卷（20/30/40 题）。

## 开发

```bash
npm install
npm run dev        # 本地开发
npm test           # vitest：生成器 / 干扰项 / 自适应 / 评分 / 讲解
npm run typecheck  # vue-tsc
npm run build      # 产物在 dist/，base 为 /math-rocket/
```

## 结构

```
src/core/        纯逻辑：generator（枚举式五档题库）、distractors、adaptive、scoring、explain
src/components/  Mascot（赛车吉祥物 SVG）、RaceTrack（进度跑道）、QuestionCard、ChoicePad、NumPad、ExplainPanel
src/views/       Home / Quiz / Result / Settings / History / PrintSheet（store.view 切换，不用 router）
src/store.ts     设置 / 历史 / 推荐档，localStorage 持久化（mr.settings / mr.history / mr.level）
src/audio/sfx.ts Web Audio 合成音效，零资源文件
docs/            01-需求与设计.md · 02-实现方案.md（含任务清单）
```

## 文档

- [docs/01-需求与设计.md](docs/01-需求与设计.md) — 目标用户、题目规则、流程、视觉、设备适配、验收标准
- [docs/02-实现方案.md](docs/02-实现方案.md) — 技术选型、目录、数据模型、算法、任务清单、风险
