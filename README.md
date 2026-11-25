# Junhao Lin 的个人主页

这是一个静态双语网站。生成后的 HTML 可直接由 GitHub Pages 从仓库根目录发布。

## 修改哪里

| 要修改的内容 | 文件 |
| --- | --- |
| 头像、学校、联系方式、共用页脚 | `source/layout.html` |
| 栏目顺序和中英文栏目名 | `source/pages.json`，首页保持在第一项 |
| 简介、奖项、项目、活动和随想 | `source/pages/` 中对应的 HTML 片段 |
| 自定义样式 | `assets/css/profile.css` |
| 语言切换与导航 | `assets/js/profile.js` |

内容片段以英文为默认文本，通过 `data-zh` 提供对应的中文。新增栏目时，在 `source/pages.json` 添加一项，再在 `source/pages/` 添加与 `file` 字段同名的 HTML 片段。根目录的页面由脚本生成。

## 生成和预览

从本目录运行，使用 Python 3，无需安装第三方依赖。

```sh
python3 build.py
python3 build.py --check
python3 -m http.server 8000
```

浏览器打开 `http://127.0.0.1:8000/`。本地 HTTP 预览支持只更新右侧内容的导航。发布时一并提交源文件和生成后的页面。
