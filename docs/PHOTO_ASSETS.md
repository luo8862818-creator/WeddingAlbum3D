# 婚纱照片与音乐素材规范

## 1. 照片放置位置

将婚纱照复制到：

assets/photos/

当前相册配置预留以下文件名：

~~~text
assets/photos/
├── cover.jpg
├── photo-01.jpg
├── photo-02.jpg
├── photo-03.jpg
├── photo-04.jpg
├── photo-05.jpg
├── photo-06.jpg
├── photo-07.jpg
└── photo-08.jpg
~~~

建议：

- 优先使用 JPG 或 WebP。
- 原图建议保留，项目内可使用经过适度压缩的副本。
- 单张照片建议控制在 2–8 MB，避免网页首次加载过慢。
- 不要把婚纱照裁切成小尺寸缩略图；建议长边至少 1600 px。
- 竖构图照片适合单页展示，横构图照片可用于跨页设计。
- 封面照片建议选择主体位于画面中间、适合裁切的照片。

如果没有放入照片，页面会显示 assets/images/photo-placeholder.svg 占位图。

## 2. 修改网页相册照片

打开：

js/config.js

找到 ALBUM_CONFIG 中的 coverImage 和 spreads。

例如：

~~~javascript
coverImage: "assets/photos/cover.jpg"
~~~

每个跨页左右各有一页，图片页的 src 对应照片路径。

例如：

~~~javascript
right: {
  type: "photo",
  src: "assets/photos/photo-01.jpg",
  caption: "THE FIRST FRAME",
  number: "01"
}
~~~

修改文件名后保存，Vite 页面会自动刷新。

## 3. 修改视频导出照片

视频合成页面是：

export.html

其中图片元素使用 data-photo-slot 标识照片位置。将对应 img 的 src 从占位图替换为真实照片路径。

例如：

~~~html
<img data-photo-slot="photo-01"
     src="assets/photos/photo-01.jpg"
     alt="Photo 01">
~~~

同一张照片可能在前后两个翻页场景中重复出现，因此同一个 data-photo-slot 可能有多个位置。替换时要确保这些位置使用同一张照片，才能保持翻页前后的连续性。

网页相册和视频导出使用相同的照片文件，但照片路径分别维护在 js/config.js 与 export.html 中。替换照片时两处都要检查。

## 4. 背景音乐

网页预览音乐配置位于 js/config.js：

~~~javascript
music: "assets/music/background.mp3"
~~~

把音乐文件放入 assets/music/background.mp3 后，网页控制栏会启用音乐按钮。浏览器通常要求用户主动点击后才能播放声音。

视频导出音乐需要在 export.html 的 root composition 内添加 HyperFrames audio clip，并确保 data-duration 覆盖音乐播放区间。例如：

~~~html
<audio
  class="clip"
  id="album-music"
  src="assets/music/background.mp3"
  data-start="0"
  data-duration="34.5"
  data-track-index="3"
  data-volume="0.55">
</audio>
~~~

音频文件必须真实存在，不能只添加路径。加入音乐后先执行草稿渲染检查声音是否正常，再进行正式导出。

## 5. 素材版权与备份

只使用自己拥有或已获授权的照片、字体和音乐。原始婚纱照建议在项目外保留一份备份。

如果照片文件很大，上传 GitHub 前先确认仓库大小限制。不要把私人照片上传到公开仓库；公开仓库中的素材任何人都可能访问。可以将仓库改为 Private，或只在本地放置个人照片，不提交 assets/photos 中的真实照片。
