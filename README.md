# 余生 · WeddingAlbum3D v2

HTML / CSS / JavaScript + Three.js 的全屏精装婚纱照片书。双页比例针对 1920×1080 画幅设计，镜头自动适配，去掉外围标题、页脚和展示区；控制栏悬浮并自动淡出。橄榄绿布面封套、象牙纸、双面细分网格、弯曲纸页、纸堆厚度、动态阴影。网页和 MP4 使用同一个渲染器与时间函数。

## Windows 本地运行
安装 Node.js 22+、Google Chrome 或 Edge，以及 PATH 中的 FFmpeg：
~~~powershell
winget install Gyan.FFmpeg
npm install
npm run dev
~~~
打开 http://127.0.0.1:5173 。安装后无需远程字体、照片或付费 API。Chrome 不在默认位置时设置 CHROME_PATH；FFmpeg 可用 FFMPEG_PATH 指定。其他系统先运行 npx playwright install chromium。

## 定制和保存
点击右上角“定制相册”，填写姓名、日期、标题、文案。选择最多三张 JPG/PNG/WebP，按选择顺序替换封面和两组内页照片；不足三张时其余保留。图片自动缩放至最长边 3200 像素，居中裁切以适配纸页。当前固定四张双面纸页，三张照片在不同版式中复用。

点击“应用修改”查看效果。点击“保存项目”下载 JSON，包含内嵌照片、文字、音乐和停留时间；下次通过“导入项目”恢复。刷新页面恢复示例，因此离开前请保存。也可以直接修改 js/config.js 的默认内容和 assets/photos 中的本地图片。

选择本地音频文件配置背景音乐，点击“♫ 音乐”开始播放。浏览器需要用户手势才能播放声音。暂停相册会暂停音乐，继续翻页后可再次点击音乐播放；视频从音频开头循环，结尾淡出。请选择有使用权的音乐。项目文件可能较大，网页导出请求上限 80MB。

控制：播放/暂停、左右按钮、方向键、空格、进度条、左右滑动。手动翻页暂停自动播放，点击继续后从当前位置恢复。播放到最后自动停止。

## MP4 导出
推荐在 npm run dev 启动的本地网页中点击“导出影片”，完成后自动下载，文件也保留在 renders。导出使用独立隐藏 Chromium，将时间精确设置为 n/30 后渲染每一帧，再送入 FFmpeg H.264 编码；不使用 MediaRecorder 或实时屏幕录制。即使电脑渲染慢，也不会遗漏帧。

命令行（无需先启动网页）：
~~~powershell
npm run render
npm run render -- --project C:\Users\yourname\Downloads\wedding-project.json
npm run render -- --project wedding-project.json --output renders\our-wedding.mp4
npm run render:test
~~~
默认完整影片约 24.7 秒，1920×1080、30 FPS、H.264/yuv420p，可选 AAC 音轨；每页停留时间可调，翻页固定 1.8 秒。render:test 输出前 6 秒，包括完整封面打开。软件 WebGL 下逐帧渲染可能耗时数分钟至更久；终端每 60 帧显示一次进度。失败时查看终端或网页状态，不会将未完成文件作为成功下载。

网页编辑内容与命令行内容一致的前提：先保存项目，再通过 --project 指定该文件。未指定时导出仓库默认配置。

## 构建与检查
~~~powershell
npm run build
npm test
npm run preview
~~~
dist 可静态部署；静态部署支持预览和编辑、项目保存。网页 MP4 按钮需要本机 Vite Node 服务，静态托管时请使用命令行导出。WebGL 为必要条件。

测试脚本检查手动控制、播放/暂停、文案和照片替换、任意顺序时间寻址一致性及手机溢出，视觉截图位于 renders。测试结果见 docs/TEST_RESULTS.md。按最新要求未完成视频导出验收。

## 实现与限制
- js/album.js：共享 Three.js 渲染器，48×8 网格、双面纹理、确定性弯曲、真实光源和阴影。
- js/app.js：编辑、项目序列化、播放控制和本地导出请求。
- scripts/render.mjs：固定时间采样、背压写入 FFmpeg、音乐混音。
- scripts/render-cli.mjs：独立本地服务生命周期。
- vite.config.js：本机导出接口、并发限制、同源检查和静态素材打包。
- 纸页使用解析弯曲模拟而非物理求解；滑动触发翻页，不提供跟手卷角。当前照片数量固定为三张。
- 不依赖旧版 StPageFlip / GSAP / HyperFrames，也没有账户或付费服务要求。
- 示例照片来源 Unsplash，来源链接见 assets/photos/SOURCES.md。示例用于演示，请替换为你们自己的婚纱照。