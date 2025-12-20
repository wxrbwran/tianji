# 部署指南

本项目支持两种部署方式：Vercel 和 Cloudflare Workers。

## Vercel 部署

### 1. 配置环境变量

在 Vercel 项目的 **Settings → Environment Variables** 中添加以下变量：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=

# AI 服务配置
DEEPSEEK_API_KEY=sk-xxx

# 站点配置
NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
```

### 2. 部署设置

- **Framework Preset**: Next.js
- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install`
- **Node Version**: 20.x

### 3. 触发部署

推送代码到 GitHub 后，Vercel 会自动部署。

## Cloudflare Workers 部署

### 1. 环境变量配置

#### 构建时环境变量（.env.production）
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=
NEXT_PUBLIC_SITE_URL=
```

#### 运行时 Secrets
使用 Wrangler 设置敏感信息：

```bash
# 设置 API keys
wrangler secret put DEEPSEEK_API_KEY
wrangler secret put ANTHROPIC_API_KEY

# 或使用脚本批量设置
./setup-secrets.sh
```

### 2. 部署命令

```bash
# 构建
npm run build

# 部署
npm run deploy

# 或预览
npm run preview
```

## 常见问题

### Q: Vercel 部署时出现 EPIPE 错误？
**A**: 确保 `next.config.ts` 中的条件判断正确，Vercel 环境不应该初始化 Cloudflare 适配器。

### Q: PNPM 警告构建脚本被忽略？
**A**: 这是正常的。`.pnpmrc` 已配置允许必要的包（如 sharp, esbuild）运行构建脚本。

### Q: 如何切换部署目标？
**A**:
- **Vercel**: 推送到 GitHub，Vercel 自动部署
- **Cloudflare**: 使用 `npm run deploy` 手动部署

## 架构说明

项目使用智能配置自动检测部署环境：

- **Vercel 环境**: 自动检测 `VERCEL=1` 环境变量，跳过 Cloudflare 初始化
- **Cloudflare 环境**: 检测 `CF_PAGES=1` 或 `CLOUDFLARE=1`，启用适配器
- **本地开发**: 默认启用 Cloudflare 适配器用于本地测试

## 性能优化

两种部署方式都启用了以下优化：

- ✅ Webpack 文件系统缓存（GZIP 压缩）
- ✅ Package imports 优化（lucide-react, @radix-ui）
- ✅ 模块解析 fallback（减少包体积）
- ✅ 图片格式优化（AVIF, WebP）
