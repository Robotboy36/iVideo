
import {
    create, q, 
    formatTime,
    clone,
    fullscreen,
    cancelFullscreen,
    toast,
    deviceInfo
} from './utils';
import { isFunction } from 'util';
import types from './types';
import status from './status';
import { isObject } from 'util';

const device = deviceInfo();

//
function iVideo (selector, params = {}) {
    let opts = {
        src: [],
        
        // 是否直播
        isLive: false,

        // 是否显示控制按钮
        controls: true,

        hasProgress: true,

        // 初始化音量
        volume: 1,

        // 是否允许全屏
        allowFull: true,
        
        // 遮罩
        poster: '',

        // 是否预加载
        preload: 'metadata',

        // 启用canvas播放
        useCanvas: false,

        // 是否使用自带控制按钮
        useSelfControls: false,

        // 行间播放，不自动全屏
        inline: true,

        // 自动播放
        autoplay: false,

        // 循环播放
        loop: false,

        // 超时设置
        timeout: 30,

        width: '100%',
        height: 220
    }

    this.selector = selector || '.ivideo-js';
    this.evts = {};
    this.opts = clone(opts, params, true);
    // 计时变量
    // 计时器开关
    this.timecount = 0;
    this.timeswitch = true;

    // 状态设置
    this.status = status.LOADING;
    this.isPaused = true;
    this.isFirstTouch = true;
    this.touchMove = false;
    // 是否点击过播放按钮
    this.touchPlay = false;

    // 是否成功初始化
    this.inited = false;
    // 相关页面元素
    this._video = null;
    this._canvas = {}; //create('canvas');

    this.init();
}


// 初始化
iVideo.prototype.init = function () {
    this.log('video init...');
    this.render();
}


// 渲染相关元素
iVideo.prototype.render = function () {
    let el = typeof this.selector === 'string' ? q(this.selector) : this.selector;

    if (!el) {
        this.error(`元素不存在，请检测传入的el参数是否正确 el=${el}, 支持元素，选择器`);
        return;
    }

    this.el = el;
    this.container = q('.ivideo', el) || create('div');
    this.container.className = 'ivideo ivideo-loading';
    // 已初始化过
    this.container.innerHTML = '';

    let components = create('div');
    components.className = 'ivideo-components';
    let html = `
        <div class="loading">
            <p><i></i>加载中...</p>
        </div>
        <div class="offline">
            <p>网络连接已断开，点击重试</p>
        </div>
        <div class="timeout">
            <p>加载超时，点击重试</p>
        </div>
        <!-- 播放与暂停大按钮 -->
        <div class="ivideo-btn"></div>
        <span class="ivideo-volume toast-hide">音量 100%</span>
        <h2 class="ivideo-title">{{title}}</h2>`;
    
    let src = this.opts.src;
    let filepath = isFunction(src) ? src[0] : isObject(src) ? src.src : src;
    let title = this.opts.title || filepath.slice(filepath.lastIndexOf('/') + 1) || '';
    html = html.replace('{{title}}', title );
    components.innerHTML = html;

    setTimeout(() => {
        this.container.appendChild(components);
        this.el.appendChild(this.container);
        //
        this._offline = q('.offline', components);
        this._timeout = q('.timeout', components);
        this._playBig = q('.ivideo-btn', components);
        this._volume = q('.ivideo-volume', components);

        this.renderVideo();
        this.setSize();
        this.videoEvt();
        this.inited = true;
    });
}


// 初始化视频播放器
// 设置行间播放
// 控制按钮
// 视频源
iVideo.prototype.renderVideo = function () {
    let opts = this.opts;
    // 视频元素
    let _video = create('video');
    _video.className = 'ivideo-video';
    _video.download = false;
    _video.crossorigin = 'anonymous';

    // 行间播放
    if (opts.inline) {
        _video.setAttribute('webkit-playsinline', true);
        _video.setAttribute('playsinline', true);
        _video.setAttribute('x5-playsinline', true);
        _video.setAttribute('x5--video--player--type', 'h5');
        _video.setAttribute('x5-video-player-type', 'h5');
        _video.setAttribute('x-webkit-airplay', 'allow');
    }

    opts.autoplay && (_video.autoplay = true);
    opts.loop && (_video.loop = true);

    // 显示控制按钮
    if (opts.controls) {
        if (opts.useSelfControls) {
            _video.controls = true;
        }
        else {
            let html = `
                <div class="ivideo-play"></div>
                <span class="ivideo-time">
                    <time class="ivideo-cur">00:00</time> /
                    <time class="ivideo-total">--:--</time>
                </span>
                {{progress}}`;
            let progressHtml = 
                `<div class="ivideo-progress">
                    <p class="ivideo-bar"></p>
                    <p class="ivideo-buffered"></p>
                </div>`;
            // 进度条控制
            html = html.replace('{{progress}}', opts.hasProgress ? progressHtml : '');

            if (opts.allowFull) {
                html += '<div class="ivideo-full"></div>';
            }
            
            let _controls = create('div');
            _controls.className = 'ivideo-controller';
            _controls.innerHTML = opts.controls ? html : '';
            this.container.appendChild(_controls);

            setTimeout(() => {
                this._playBtn = q('.ivideo-play', _controls);
                this._cur = q('.ivideo-cur', _controls);
                this._duration = q('.ivideo-total', _controls);
                this._fullBtn = q('.ivideo-full', _controls);
                this._progress = q('.ivideo-progress', _controls);
                this._bar = q('.ivideo-bar', _controls);
                this._buffer = q('.ivideo-buffered', _controls);
            });
        }
    }

    this._video = _video;
    this.src(opts.src);
    this.container.appendChild(this._video);
    // 执行用户监听函数
    this.execute('ready');
}


// 视频事件监听
iVideo.prototype.videoEvt = function () {
    let _video = this._video;
    let el = this.container;
    let _this = this;

    _video.addEventListener('canplaythrough', () => {
        this.timeswitch = false;
        el.classList.remove('ivideo-' + status.LOADING);
        el.classList.remove('ivideo-' + status.WAITING);
        // 暂停状态
        if (_video.paused) {            
            el.classList.add('ivideo-' + status.PAUSED);
        }

        // 是否是点击播放过来
        if (this.isFirstTouch && this.touchPlay && device.isWeixin) {
            this.play();
            this.isFirstTouch = false;
            this.touchPlay = false;
        }

        if (this._duration) {
            let duration = formatTime(_video.duration);
            this._duration.innerHTML = duration;
        }
    });

    // 缓冲暂停，缓冲完成后隐藏加载文案
    ['playing', 'waiting', 'seeking', 'seeked'].forEach(function(evt){
        _video.addEventListener(evt, function (e) {
            switch (e.type) {
            case 'waiting':
            case 'seeking':
                el.classList.add('ivideo-' + status.WAITING);
                // _this.alert('waiting' + el.classList);
                break;
            case 'playing':
            case 'seeked':
                el.classList.remove('ivideo-' + status.WAITING);
                break;
            }

            _this.execute(evt);
        });
    });

    // 发生错误
    ['error'].forEach(function(evt){
        _video.addEventListener(evt, function (e) {
            _this.error(e);
        });
    });

    _video.addEventListener('play', () => {
        el.classList.remove('ivideo-' + status.PAUSED);
        el.classList.remove('ivideo-' + status.LOADING);
        el.classList.remove('ivideo-' + status.WAITING);
        // 执行用户监听函数
        this.execute('play');
    });

    _video.addEventListener('pause', () => {
        el.classList.add('ivideo-' + status.PAUSED);
        // 执行用户监听函数
        this.execute('pause');
    });

    // 播放中...
    _video.addEventListener('timeupdate', () => {
        if (!navigator.onLine) {
            this.setStatus(status.OFFLINE);
            return;
        }

        if (this.opts.controls) {
            if (!this._cur) {
                this._cur = q('.ivideo-cur', el);
            }
    
            let cur = formatTime(_video.currentTime);
            this._cur.innerHTML = cur;

            // 进度条
            if (!_video.duration || _video.currentTime === 0) {
                return;
            }        
            // 计算进度条长度
            let width = this.getWidthForTime(this._video.currentTime);
            this._bar.style.width = width + 'px';
            //
            this.setBuffer();
        }
        // 执行用户监听函数
        this.execute('timeupdate');
    });
    

    // 用户操作相关
    // 播放与暂停
    // 控制条等控制
    // 滑动调整音量和播放进度
    let pos = { fx: 0, fy: 0, x: 0, y: 0 };
    //
    el.addEventListener('touchstart', (e) => {
        if (el.classList.contains('video-' + status.LOADING)) {
            e.preventDefault();
            return;
        }

        this.touchPlay = false;
        this.touchMove = false;
        this.isPaused = this._video.paused;
        //
        let touch = e.changedTouches[0];
        pos.x = touch.pageX;
        pos.y = touch.pageY;
        pos.fx = touch.pageX;
        pos.fy = touch.pageY;
    });
    // 
    el.addEventListener('touchmove', (e) => {
        this.touchMove = true;
        e.preventDefault();
    
        let touch = e.changedTouches[0];
        let x = touch.pageX;
        let y = touch.pageY;
        // 判断是否是纵向滑动
        // 纵向滑动调整音量
        // 横向滑动调整播放进度
        let isY = Math.abs(y - pos.fy) > Math.abs(x - pos.fx);
        let isX = Math.abs(x - pos.fx) > Math.abs(y - pos.fy);

        if (isY) {
            let volume = pos.y - y > 0 ? 1 : -1;
            this.setVolume(volume);
        } else if (isX) {
            let distance = (x - pos.x);
            this.setCurrentTime(distance);
        }

        pos.x = touch.pageX;
        pos.y = touch.pageY;
    });

    el.addEventListener('touchend', (e) => {
        let t = e.target;
        let tag = t.tagName.toLowerCase();
        let clist = t.classList;

        // 加载中
        if (el.classList.contains('ivideo-' + status.LOADING)) {
            return;
        }

        // 按钮控制播放暂停
        if (clist.contains('ivideo-btn') || clist.contains('ivideo-play')) {
            if (device.isWeixin && this.isFirstTouch) {
                this.touchPlay = true;
                this.reload();
            } else {
                _video.paused ? this.play() : this.pause();
            }
            return;
        }

        //
        if (!this.touchMove && tag === 'video') {
            el.classList.contains('ivideo-hidepro') ? el.classList.remove('ivideo-hidepro'):el.classList.add('ivideo-hidepro');
            return;
        }

        // 全屏
        if (this.opts.allowFull && clist.contains('ivideo-full')) {
            if (el.classList.contains('full')) {
                cancelFullscreen();
                el.classList.remove('full');
            }
            else {
                el.classList.add('full');
                fullscreen(el);
            }
            return;
        }
        
        // 滑动松开后
        if (!this.isPaused && this.touchMove) {
            this._video.play();
        }
    });

    // 超时与掉线
    [this._offline, this._timeout].forEach(el => {
        el.addEventListener('touchend', () => {
            this.reload();
        });
    });
}


// 设置播放进度
// 滑动设置播放进度
// 步进值， 滑动距离
iVideo.prototype.setCurrentTime = function (moveDistance) {
    // 拖动时暂停
    this._video.pause();

    let curWidth = this._bar.offsetWidth;
    let pos = curWidth + moveDistance;

    if (pos < 0 || pos > this._progress.offsetWidth) {
        this.log('超出播放范围');
        return;
    }

    // 限定区间， 0 ~ _progress.offsetWidth
    pos = pos < 0 ? 0 : pos;
    pos = pos > this._progress.offsetWidth ? this._progress.offsetWidth : pos;
    // 设定宽度
    // 设定播放时间
    this._bar.style.width = pos + 'px';
    this._video.currentTime = pos / this._progress.offsetWidth * this._video.duration;
    this._cur.innerHTML = formatTime(this._video.currentTime);
}


// 设置video大小
// size: {width: 200, height: 200}
iVideo.prototype.setSize = function (size) {
    let opts = this.opts;
    size = size || {
        width: opts.width,
        height: opts.height
    }

    this._canvas.width = parseInt(size.width);
    this._canvas.height = parseInt(size.height);
    this.container.style.width = typeof size.width === 'number' ? size.width + 'px' : size.width;
    this.container.style.height = typeof size.height === 'number' ? size.height + 'px' : size.height;
}


// 更新视频连接
// 视频类型默认 mp4
// 支持传入 string
// object {src: '', type: ''}
// array [{src: '', type: ''}]
iVideo.prototype.src = function (sources) {
    sources = typeof sources === 'string' ? {src: sources} : sources;

    if (!Array.isArray(sources)) {
        sources = [sources];
    }
    //
    if (sources.length === 0) {
        this.warn('请传入src参数');
        return;
    }

    // 同步数据
    this.opts.src = sources;

    let html = '';
    sources.forEach(item => {
        let type = types[item.type];
        html += `<source src="${item.src}"`;
        html += type ? ` type="${type}" />` : '/>';
    });

    if (!navigator.onLine) {
        this.setStatus(status.OFFLINE);
        return;
    }

    this._video.innerHTML = html;
    this.reload();
}


// 数据重置
iVideo.prototype.reload = function () {
    // 启动加载计时器
    this.timeswitch = true;
    this.timer();

    if (!(device.isWeixin && !this.inited)) {
        this.setStatus(status.LOADING);
    } else {        
        this.container.classList.remove('ivideo-' + status.LOADING);
        this.container.classList.add('ivideo-' + status.PAUSED);
    }

    this._bar && (this._bar.style.width = 0);
    this._buffer && (this._buffer.style.width = 0);
    this._video.load();
}


// 播放控制
// 开始播放
iVideo.prototype.play = function () {
    this._video.play();
}

// 暂停
iVideo.prototype.pause = function () {
    this._video.pause();
}

// 停止
iVideo.prototype.stop = function () {
    this._video.load();
}

iVideo.prototype.muted = function (muted) {
    this._video.muted = muted;
}


// 计时器
iVideo.prototype.timer = function () {
    if (!this.timeswitch) {
        this.timecount = 0;
        return;
    }

    this.timecount++;

    // timeout
    if (this.timecount === this.opts.timeout) {
        this.setStatus(status.TIMEOUT);
        this.timecount = 0;
        this.warn('加载超时');
        return;
    }

    setTimeout(() => {
        this.timer();
    }, 1000);
}


// 状态控制
iVideo.prototype.setStatus = function (statusName = '') {
    if (!status[statusName.toUpperCase()]) {
        this.warn('不存在该状态，设置失败。setStatus:', statusName);
        return;
    }

    let el = this.container;
    switch (statusName) {
        case status.LOADING:
            el.classList.remove('ivideo-' + status.OFFLINE);
            el.classList.remove('ivideo-' + status.TIMEOUT);
            break;
        case status.OFFLINE:
        case status.TIMEOUT:
            this.timeswitch = false;
            el.classList.remove('ivideo-' + status.LOADING);
            el.classList.remove('ivideo-' + status.WAITING);
            break;
    }

    let cName = 'ivideo-' + statusName;
    el.classList.add(cName);
}


// 根据时间计算当前进度条宽度
iVideo.prototype.getWidthForTime = function (time) {
    let size = this._progress.getBoundingClientRect();
    return time / this._video.duration * size.width;
}

// 根据宽度计算时间
iVideo.prototype.getTimeForWidth = function (width) {
    let size = this._progress.getBoundingClientRect();
    return width / size.width * this._video.duration;
}


// 设置音量
// 限定 0 ~ 1
iVideo.prototype.setVolume = function (value) {
    let v = this._video.volume * 100 + value;
    v = Math.max(0, Math.min(100, v));

    // this._video.muted = true;
    this._video.volume = v / 100;
    this._volume.innerHTML = '音量 ' + Math.ceil(v) + '%';
    toast(this._volume);
}

// 设置缓冲进度
iVideo.prototype.setBuffer = function () {
    // 设置缓冲进度
    if (this._video.readyState === 4) {
        let length = this._video.buffered.length;
        let buffered = this.getWidthForTime(this._video.buffered.end(length - 1));
        this._buffer.style.width = buffered + 'px';
    }
}



//
// 注入事件
// type: 事件名称
// ready: 准备就绪
// play: 开始播放
// pause: 暂停
// timeudpate: 进行中
// 
// handler： 处理函数
iVideo.prototype.on = function (type, handler) {
    if (typeof type !== 'string' || !isFunction(handler)) {
        this.warn('事件类型请传入字符串, 事件函数必须为函数');
        this.warn('type =', type, 'handler =', handler);
        return;
    }

    if (!this.evts[type]) {
        this.evts[type] = [];
    }

    this.evts[type].push(handler);
}


// 执行事件
iVideo.prototype.execute = function (type) {
    if (!this.evts[type]) {
        return;
    }

    let data = {
        video: this._video,
        src: this.opts.src
    }

    this.evts[type].forEach(handler => {
        handler(data);
    });
}


// 注入中间件
iVideo.use = function (middlewave = []) {
    if (!Array.isArray(middlewave)) {
        middlewave = [middlewave];
    }

    middlewave.forEach(m => {
        m.instance(iVideo.prototype);
    });
}




export default iVideo;
