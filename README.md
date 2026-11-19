# WeddingAlbum3D

一套原生 HTML / CSS / JavaScript 婚纱照 3D 电子相册。

项目分为两个部分：

- 网页相册：使用 StPageFlip（page-flip）实现精装封面、双页展开、纸张翻页、自动播放和手动翻页。
- 视频合成：使用独立的 HyperFrames composition，通过 GSAP 时间轴逐帧渲染 MP4，避免依赖实时录屏。

## 当前版本

V1.0 项目骨架与首个可运行版本。

- 画面设计：暖象牙白、香槟金、深色背景。
- 相册规格：横屏双页、精装封面、纸张阴影。
- 自动翻页：默认开启，翻到最后一页自动停止。
- 照片素材：尚未放入真实婚纱照时显示本地占位图。
- 视频导出：使用 export.html，输出 1920×1080、30 FPS MP4。

## 本地运行

需要 Node.js 22 或更高版本。

~~~powershell
npm install
npm run dev
~~~

浏览器打开终端显示的地址，默认是 http://127.0.0.1:5173。

完整安装、运行和视频导出步骤见：

- docs/LOCAL_SETUP_AND_EXPORT.md
- docs/PHOTO_ASSETS.md

## 替换婚纱照

将照片放入 assets/photos，按 docs/PHOTO_ASSETS.md 的文件名放置，然后修改 js/config.js 和 export.html 中对应的图片路径。

## 视频导出

安装 FFmpeg 后运行：

~~~powershell
npm run render:draft
npm run render
~~~

视频输出到 renders 目录。

注意：网页预览使用 StPageFlip 的交互式翻页引擎；HyperFrames 导出使用 GSAP 驱动的确定性 3D 翻页时间轴。两者使用相同的照片素材和视觉规范，但导出动画不是通过录制网页交互实现。

## 技术与许可

- page-flip / StPageFlip：MIT License，负责网页交互式纸张翻页。
- GSAP：负责视频合成时间轴。
- HyperFrames：负责逐帧捕获与 FFmpeg 编码。
- Vite：本地开发服务器与静态资源构建。

项目不包含付费模型，也不需要后端服务。
