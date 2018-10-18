# iVideo
```
倔强的移动端视频播放插件, 目前仅支持移动端点播
new iVideo(selector, options);
```

## 使用示例
- 在页面上引入 js和css 
- &lt;link rel="stylesheet" href="css/video.css"&gt;
- &lt;script src="js/ivideo.min.js"></script&gt;
```
var player = new iVideo('.video', {
  src: 'zhejiushivideo.mp4',
  controls: true,
  poster: '视频预览图.png'
});

```


## API
### 参数配置
- selector: 支持 css3选择器， 也可以传入元素对象
- options: {} 相关配置项
``` javascript
  options = {
        // 视频源
        // 支持 string, object, array
        // 例如：'dd.mp4'
        // {src: 'dd.mp4', type: 'mp4'}
        // [{src: 'dd.mp4'}, {src: 'dd.ogg'}]
        src: [],
        // 是否显示控制按钮
        controls: true,
        // 是否包含进度条
        hasProgress: true,
        // 初始化音量
        volume: 1,
        // 是否允许全屏
        allowFull: true,
        // 遮罩
        poster: '',
        // 是否预加载
        preload: 'metadata',
        // 是否使用自带控制按钮
        useSelfControls: false,
        // 行间播放，不自动全屏
        inline: true,
        // 自动播放
        autoplay: false,
        // 循环播放
        loop: false,
        // 超时设置 单位s
        timeout: 30,
        width: '100%',
        height: 220
    }
```


### 常用api
- 播放：player.play()
- 暂停：player.pause()
- 动态设置视频源：player.src( src )
- 动态设置音量：player.setVolume( volume )


### 事件交互
- 支持事件： play, pause, timeupdate, canplaythrought, reload
``` javascript
  player.on('play', function (data) {
    console.log(data);
  });
```




