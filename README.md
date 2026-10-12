# 智校 · 移动端设计工作区

用于移动端 H5 设计、交互预览与开发交付。React + TypeScript + Vite + Base UI，基础设计规范继承智校 PC，移动端独立维护。

## 启动

```sh
nvm use
pnpm install --frozen-lockfile
pnpm dev:lan
```

运行时 Node 22.17.0；pnpm 11.25.0（packageManager 已锁定）。
电脑访问 http://localhost:5178/ 。首页点击「手机预览」，扫码或复制局域网链接到手机。
手机与电脑连接同一 Wi-Fi，电脑保持运行；项目改动自动热更新。无二维码时检查网络连接，端口、防火墙和访客网络隔离可能影响访问。

## 页面

- /#/：设计工作区，iframe 真实 viewport，支持 360/375/390/430px 和 Light/Dark。
- /#/mobile：独立手机组件预览，当前无业务页面。
- /#/handoff：基础尺寸、自动生成的颜色 token、组件索引与来源。

浏览器 hash 路由支持静态托管；未发布到公网。二维码属于局域网地址，不代表公网部署。

## 验证

```sh
pnpm check
pnpm build
pnpm test:e2e
```

测试使用本机 Chrome（见 playwright.config.ts）。没有 Chrome 时可安装 Chrome，或改为 Playwright Chromium 并执行 pnpm exec playwright install chromium。
构建产物位于 dist/；pnpm preview 可在本地验证生产构建。
真机键盘、安全区和微信 WebView 尚需设备验收，不能由桌面模拟替代。

## 规范与目录

先读 DESIGN.md，详细规范在 design-system/。
颜色链路：palette.json → roles.json → tokens.json → CSS → 本地组件。
修改 token 后运行 pnpm generate:tokens；pnpm check:generated 验证生成文件同步。
PC 来源及哈希见 design-system/tokens/sources/，构建不依赖 PC 项目目录。
src/components/ui/ 封装基础交互；src/pages/ 放页面；业务版本遵循 design-system/page-versioning.md。

初始化包含工程入口和组件示例；没有账号、权限、真实接口或业务数据。后续从第一个真实业务页面逐步建立组件与页面库。
