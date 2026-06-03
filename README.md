# 重庆八中无人机社团网站

一个用于展示无人机社团信息的网站，包含首页、社团规章、赛项规则、培训资料和 Q&A 问答板块。培训资料模块使用 Express API 和本地文件存储，通过 Render 部署。

## 功能

- 社团简介和快速导航
- 社团规章展示
- 赛项规则展示
- 培训资料上传、下载、删除
- Q&A 问答列表

## 本地预览

仅预览静态页面：

```bash
python -m http.server 8087 --bind 127.0.0.1
```

然后打开：

```text
http://127.0.0.1:8087/
```

如需调试 API：

```bash
npm install
npm run start
```

## 部署配置

部署到 Render 时需要配置环境变量：

```text
ADMIN_TOKEN=管理员上传和删除资料时使用的口令
```

前端 API 地址在 `js/config.js` 中配置。默认 `apiBase` 为空，表示使用当前站点同源 API。

## 测试

```bash
npm test
```
