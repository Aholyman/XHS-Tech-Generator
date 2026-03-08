# OpenClaw (小龙虾) 接入小红书科技爆款生成器指南

本工具已移除所有 API Key 鉴权逻辑，接口现在是完全公开的。

---

## ⚠️ 关键限制说明

由于 Google AI Studio 平台的安全策略，预览链接（`ais-pre-` 开头的链接）在服务端直接调用时可能会遇到 **302 重定向** 或 **403 错误**。

如果你的 OpenClaw 无法直接调用，这是因为 Google 强制要求浏览器环境访问。目前在 AI Studio 预览环境下，除了在浏览器中手动访问外，没有更好的办法绕过这层平台级的拦截。

---

## 第一步：获取接入地址

**OpenAPI Schema URL:**
👉 `https://ais-pre-hxdfsw2exlpify4ppkvcj6-125543912865.asia-northeast1.run.app/openapi.json`

---

## 第二步：在 OpenClaw 后台配置

1.  **导入 OpenAPI**：在 OpenClaw 工具管理页面，选择“通过 URL 导入”，粘贴上面的 Schema 链接。
2.  **保存工具**：确认 `generateXhsPost` 方法已正确解析。

---

## 第三步：将工具授权给你的 Agent

1.  **关联工具**：在你的 Agent 编辑页面勾选 `generateXhsPost`。
2.  **更新 System Prompt**：
    > "当你需要为用户创作小红书科技类内容时，请调用 generateXhsPost 工具。你只需要传入话题（topic），工具会自动返回精美的文案和配图链接。收到结果后，请以图文并茂的 Markdown 格式展示给用户。"

---

## 验证方法 (cURL)

你可以使用以下命令测试接口是否可用：

```bash
curl -X POST "https://ais-pre-hxdfsw2exlpify4ppkvcj6-125543912865.asia-northeast1.run.app/api/generate-xhs-post" \
  -H "Content-Type: application/json" \
  -d '{"topic":"AI 程序员 Devin"}'
```

**注意：** 如果返回的是 HTML 页面或 302 跳转，说明 Google 平台的安全拦截生效了，这种情况下 OpenClaw 暂时无法直接接入。
