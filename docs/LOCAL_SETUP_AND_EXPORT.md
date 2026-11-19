# 本地运行与 MP4 导出说明

本文档按 Windows 11 + PowerShell 编写。下次重新下载项目时，按顺序执行即可。

## 1. 环境要求

| 软件 | 要求 | 用途 |
|---|---|---|
| Node.js | 22 或更高版本 | 安装依赖、运行网页 |
| npm | 随 Node.js 安装 | 包管理 |
| FFmpeg | 已加入 PATH | HyperFrames 编码 MP4 |
| HyperFrames | 使用 npx 自动调用 | 网页时间轴逐帧渲染 |
| Chromium | HyperFrames 管理的浏览器 | 捕获视频帧 |

本项目不需要后端，不需要付费模型。

检查 Node.js：

~~~powershell
node -v
npm -v
~~~

如果 Node.js 版本低于 22，请先升级到 Node.js 22 或更高版本。

检查 FFmpeg：

~~~powershell
ffmpeg -version
ffprobe -version
~~~

如果没有 FFmpeg，可在 Windows PowerShell 中尝试：

~~~powershell
winget install ffmpeg
~~~

安装完成后，关闭并重新打开 PowerShell，再执行版本检查。如果 winget 源中没有对应包，请按 FFmpeg 官方 Windows 安装说明安装，并确保 ffmpeg.exe 所在目录加入 PATH。

## 2. 首次下载项目

选择一个本地项目目录，例如 D:\\frontProject：

~~~powershell
cd D:\\frontProject
git clone https://github.com/luo8862818-creator/WeddingAlbum3D.git
cd WeddingAlbum3D
npm install
~~~

npm install 会安装 page-flip、GSAP 和 Vite，并通过 postinstall 将 GSAP 浏览器文件复制到 vendor/gsap.min.js，供独立的 HyperFrames composition 使用。

以后更新代码，不要重复 clone，只需要：

~~~powershell
cd D:\\frontProject\\WeddingAlbum3D
git pull origin main
npm install
~~~

如果 Git 提示本地文件有未提交修改，先备份或提交自己的修改，再执行 pull，不要直接覆盖自己的照片或配置。

## 3. 启动网页相册

~~~powershell
npm run dev
~~~

浏览器访问：

http://127.0.0.1:5173

网页相册功能：

1. 封面为精装硬封面样式。
2. 翻开后以左右双页方式展示照片。
3. 默认等待约 2.2 秒后开始自动翻页。
4. 每个跨页默认停留约 5.2 秒。
5. 可以点击左右翻页按钮，也可以拖动纸张。
6. 可以使用键盘左右方向键翻页，空格键暂停或继续。
7. 翻到最后一页后自动停止，不循环。

停止网页服务：在运行 npm run dev 的 PowerShell 窗口按 Ctrl + C。

## 4. 预览视频合成时间轴

视频使用独立的 export.html，不是通过录屏网页交互得到的。

保持 npm run dev 运行，在浏览器打开：

http://127.0.0.1:5173/export.html

该页面会自动播放封面打开和双页翻页的导出动画。这里的动画由 GSAP 时间轴控制，适合 HyperFrames 按时间点逐帧捕获。

注意：网页交互预览使用 StPageFlip 的纸张翻页引擎；视频导出使用 GSAP 控制的确定性 3D 翻页场景。两者使用同一组照片文件和相近的相册视觉设计。导出场景采用 CSS 3D 纸张旋转与折页阴影模拟，不是 StPageFlip 实时 Canvas 动画的逐帧录制。

## 5. 检查 HyperFrames 环境

在项目根目录执行：

~~~powershell
npm run hf:doctor
~~~

也可以直接执行：

~~~powershell
npx hyperframes doctor
~~~

重点检查：

- Node.js 版本满足要求。
- FFmpeg 和 FFprobe 能正常识别。
- Chrome / Chromium 可用。

如果 HyperFrames 浏览器没有准备好，可以执行：

~~~powershell
npx hyperframes browser ensure
npx hyperframes doctor
~~~

## 6. 先导出低质量测试视频

先执行草稿渲染，确认翻页时间、照片顺序和画面构图：

~~~powershell
npm run render:draft
~~~

输出文件：

renders\\wedding-album-preview.mp4

草稿模式使用较快的编码参数，适合检查效果，不建议作为最终交付。

## 7. 导出正式 MP4

确认草稿效果后执行：

~~~powershell
npm run render
~~~

输出文件：

renders\\wedding-album-final.mp4

默认输出规格：

- 分辨率：1920 × 1080
- 画面比例：16:9
- 帧率：30 FPS
- 编码质量：High
- 渲染方式：HyperFrames 逐帧捕获 + FFmpeg 编码
- 输出目录：renders

正式渲染时间取决于照片数量、电脑 CPU、磁盘和浏览器环境。首次运行还可能需要准备 HyperFrames 浏览器缓存。

## 8. 不使用 npm script 时的直接命令

草稿：

~~~powershell
npx hyperframes render --composition export.html --output renders/wedding-album-preview.mp4 --fps 30 --quality draft --workers 1
~~~

正式：

~~~powershell
npx hyperframes render --composition export.html --output renders/wedding-album-final.mp4 --fps 30 --quality high --workers 2
~~~

如果电脑内存或 CPU 比较紧张，可以将 workers 改为 1。增加 workers 不一定总能缩短时间，过多并行 Chrome 进程反而可能造成资源竞争。

## 9. 常见问题

### 9.1 npm install 失败

先检查 Node.js 版本和网络，再执行：

~~~powershell
npm cache verify
npm install
~~~

不要删除 package.json 后随意安装不同版本依赖。

### 9.2 页面显示占位图

这是正常现象。项目初始不包含个人婚纱照。按 docs/PHOTO_ASSETS.md 放入照片后，网页和视频合成页面会显示真实照片。

### 9.3 HyperFrames 找不到 FFmpeg

执行：

~~~powershell
ffmpeg -version
ffprobe -version
~~~

如果命令无法识别，说明 FFmpeg 没有正确加入 PATH。重新配置环境变量并打开新的 PowerShell 窗口。

### 9.4 导出时浏览器或编码失败

依次执行：

~~~powershell
npx hyperframes doctor
npm run render:draft
~~~

先使用单 worker 草稿渲染，查看终端最后的错误信息。不要同时启动多个正式渲染任务。

### 9.5 想修改翻页速度

网页相册：修改 js/config.js 中的 pageHoldMs 和 flipDuration。

视频相册：修改 js/export.js 中的 spreadInterval、flipOffset 和翻页 duration。修改后先重新导出草稿检查时间轴。

## 10. 建议的日常工作流程

1. git pull origin main
2. npm install
3. 将婚纱照放入 assets/photos
4. 修改 js/config.js 和 export.html 中的照片路径
5. npm run dev 检查网页翻页
6. 浏览器检查 export.html 的视频动画
7. npm run render:draft 检查 MP4
8. npm run render 导出正式视频

每次先导出草稿，确认后再导出正式视频，避免反复进行高质量长时间渲染。
