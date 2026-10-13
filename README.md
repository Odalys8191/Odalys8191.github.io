
# Odalys 的 Hexo 博客

这是可以直接编辑、备份和重建的博客源码。旧站发布快照来自 `master` 的 `f799a72cc7cbf2fa2b67543bafdc225a9b9e4d8c`。源码使用 Hexo 8、NexT 8 的 Muse 样式；详细版本固定在 `package-lock.json`。

## 本地启动（当前 Mac）

不需要 Python 虚拟环境或 Docker。项目的 `.tools/` 保存独立 Node.js 24.21.0，`node_modules/` 保存依赖，不会替换系统 Node.js。

```bash
cd /Users/odalys/Documents/ChatGPT/blogsetup
./blog start
```

打开 <http://127.0.0.1:4000>。修改文章后刷新浏览器即可；终端按 `Ctrl+C` 停止服务。

换电脑后，先克隆源码分支，再安装：

```bash
git clone --branch main https://github.com/Odalys8191/Odalys8191.github.io.git blog
cd blog
# 需要有可用的 npm 来安装项目内 Node.js：
./blog setup
./blog start
```

如果已用 nvm 安装 `.nvmrc` 中的版本，也可以直接 `npm ci`、`npm start`；Windows 使用这些 npm 命令。

## 写文章

```bash
./blog new "文章标题"
```

编辑生成的 `source/_posts/文章标题.md`。`<!-- more -->` 前面作为首页摘要。不要随意改已发布文章的 `permalink`，否则旧链接会失效。

图片放在 `source/images/文章名/`，然后写：

```markdown
![图片说明](/images/文章名/example.png)
```

公式使用 `$a_i$` 或独立行上的 `$$ ... $$`。引号中的美元用 `\$`。支持 KaTeX 数学语法，矩阵和对齐环境写在 `$$` 内；不执行完整 LaTeX 文档。参考 `examples/new-post.md`。公式在构建时生成，浏览器只加载同站点的字体和样式。

未完成的文章可使用 `./blog new draft "标题"`，存放在 `source/_drafts/`，默认不发布。不要把密码、私钥或不希望公开的草稿提交到这个公开仓库。

## 发布到原来的 GitHub Pages

源码已合入 `main`，`master` 保留原站发布快照。首次启用自动部署时，需要以下仓库设置：

1. 仓库 `Settings → Pages → Build and deployment → Source` 选择 **GitHub Actions**。
2. 若 `github-pages` 环境有限制，在 `Settings → Environments → github-pages` 中允许 `main` 部署。
3. 在 `Actions → Build and publish Hexo` 中检查运行结果；必要时在 `main` 手动运行一次。

恢复分支只构建和校验，不部署。`main` 的推送会自动构建、校验并部署。使用 GitHub 自带的 `GITHUB_TOKEN`，无需把个人访问令牌写进配置。

日常更新（已经在 `main` 时）：

```bash
./blog build
./blog check
git add source
git commit -m "发布新文章"
git push origin main
```

如果改了配置或依赖，也提交对应配置和 `package-lock.json`。不要提交 `node_modules/`、`public/`、`.tools/`。主题配置在 `_config.next.yml`，样式覆盖在 `source/_data/styles.styl`，不要编辑 `node_modules` 下的主题文件。

## 恢复结果与局限

- 保留 77 篇文章记录：68 篇有正文、6 篇加密、3 篇在最新发布快照中已经为空。
- 另恢复 5 个独立页面，其中「冥人冥言」也加密。
- 文章与独立页面共恢复 1,592 个已有 TeX 注释的公式和 45 个代码块；保留 73 个重复版本网址，并修复 1 个更早的旧文链接，共 74 个跳转。
- 保留旧站本地图片和 14 个 PDF；9 张正文外链图片中有 7 张已下载到 `source/images/recovered/`。
- 另 2 张图床图片当前不可取得，原链接保留，清单在 `migration/images.json`。
- 加密内容及 HMAC 原样保留，继续使用原密码在浏览器解密；未取得密码，不能验证真实正文。旧运行脚本仅移除了输出缓存密钥的调试日志。
- 空正文为「高雅大话」「大门狂摘！」「胡思乱想」。恢复时没有用旧版本覆盖最新的空内容。
- 原网页中本来就未正确渲染的公式片段保留为文字，不猜测或修改作者的数学内容。恢复的 Markdown 不是遗失原稿的逐字副本，首次编辑时可结合备份复核排版。

`migration/report.json` 保存恢复来源、公式、代码块和校验基线；`migration/redirects.json` 保存旧网址。`./blog check` 检查输出资产、公式错误、导航、旧链接、密文、源码代码块和同站点字体。对后续人工编辑的旧文章，跳过原始内容基线比较，但继续执行站点检查。

## 备份与维护

源码（文章、图片、配置、脚本、锁文件）应持续提交 GitHub，并另存一份离线备份。原始发布快照目前放在本机 `recovery-audit/published-master-f799a72c.tar.gz`，没有提交到源码分支；不要只备份 `public/`。

`tooling/recover-posts.cjs` 是一次性恢复工具，依赖本机 `recovery-audit/original/` 与搜索索引。日常写作无需运行它；`--force` 会覆盖恢复出的文章，开始人工编辑后不要再次执行。普通构建不依赖原始快照。

本地构建不会解决运营商到 GitHub Pages 的连接问题。主题必要资源已改为同站点加载，后续若仍无法连接域名，需要单独检查 DNS、网络或调整托管位置。
