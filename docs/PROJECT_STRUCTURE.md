# 项目结构

~~~text
WeddingAlbum3D/
├── index.html                    # 网页相册入口
├── export.html                   # HyperFrames 视频合成入口
├── package.json                  # 依赖和执行命令
├── vite.config.js                # Vite 本地开发配置
├── README.md
├── .gitignore
│
├── css/
│   ├── style.css                 # 网页整体布局
│   ├── album.css                 # 相册纸张、封面和页面样式
│   └── animation.css             # 网页入场动画
│
├── js/
│   ├── app.js                    # 网页程序入口
│   ├── album.js                  # StPageFlip 相册初始化和页面生成
│   ├── autoplay.js               # 自动翻页
│   ├── controls.js               # 翻页、进度、音乐和键盘控制
│   ├── config.js                 # 照片、文案和播放参数
│   └── export.js                 # GSAP 视频时间轴
│
├── assets/
│   ├── photos/                   # 个人婚纱照
│   ├── music/                    # 背景音乐
│   ├── images/
│   │   └── photo-placeholder.svg # 本地照片占位图
│   └── fonts/                    # 可选本地字体
│
├── docs/
│   ├── LOCAL_SETUP_AND_EXPORT.md # 本地运行和 MP4 导出
│   ├── PHOTO_ASSETS.md           # 照片与音乐替换规范
│   └── PROJECT_STRUCTURE.md
│
└── renders/                      # 本地导出视频（不提交 MP4）
~~~

网页播放与视频导出分开：

- index.html 使用 StPageFlip 负责真实交互式翻页。
- export.html 使用 GSAP 时间轴，供 HyperFrames 按时间点逐帧渲染。
- 两个入口共享照片素材目录，但分别维护页面结构和动画实现。
