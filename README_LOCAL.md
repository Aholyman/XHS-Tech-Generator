# 本地运行与部署指南 (Local Deployment Guide)

由于 Google AI Studio 预览链接的平台限制（302 重定向），建议将本项目部署到本地或你自己的服务器上，以便 OpenClaw 能够直接通过 API 访问。

## 1. 环境准备
- **Node.js**: 建议版本 18.x 或更高。
- **npm**: 随 Node.js 一同安装。
- **Gemini API Key**: 从 [Google AI Studio](https://aistudio.google.com/app/apikey) 获取。

## 2. 本地快速启动
1. **下载代码**：将项目所有文件下载到本地文件夹。
2. **安装依赖**：
   ```bash
   npm install
   ```
3. **配置环境变量**：
   在根目录创建 `.env` 文件，并填入你的 API Key：
   ```env
   GEMINI_API_KEY=你的_GEMINI_API_KEY
   PORT=3000
   ```
4. **编译并启动**：
   ```bash
   npm run build
   npm start
   ```
5. **验证**：
   访问 `http://localhost:3000/api/health`。如果返回 `{"status":"ok"}`，说明服务已启动。

---

## 3. 使用 Docker 部署 (推荐用于服务器)
如果你有自己的服务器，使用 Docker 是最简单的方式。

1. **构建镜像**：
   ```bash
   docker build -t xhs-generator .
   ```
2. **运行容器**：
   ```bash
   docker run -d \
     -p 3000:3000 \
     -e GEMINI_API_KEY=你的_GEMINI_API_KEY \
     --name xhs-app \
     xhs-generator
   ```

---

## 4. 在 OpenClaw 中接入
部署完成后，将 OpenClaw 中的 API 地址修改为你自己的服务器地址：

- **OpenAPI Schema**: `http://你的服务器IP:3000/openapi.json`
- **API Endpoint**: `http://你的服务器IP:3000/api/generate-xhs-post`

---

## 5. 常见问题
- **如何让外网访问本地电脑？**：可以使用 `ngrok` 或 `cpolar`。例如：`ngrok http 3000`。
- **Gemini 免费吗？**：是的，只要使用免费层级的 API Key，Gemini Flash 依然是免费的。
