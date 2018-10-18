
// 判断设备类型
export function deviceInfo () {
    let userAgent = window.navigator.userAgent;

    return {
        isIphone: /iPhone/i.test(userAgent),
        isIpad: /iPad/i.test(userAgent),
        isAndroid: /Android/i.test(userAgent),
        isMac: false,
        isWeixin: /MicroMessenger/i.test(userAgent),
        isQQ: /QQ\//.test(userAgent),
        isQQBrowser: /MQQBrowser/.test(userAgent),
        isChrome: /Chrome/.test(userAgent),
        isIE: false,
        isFirefox: false,
        isSafari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
        version: 0,
        userAgent,
    }
}



// 获取当前时间
export function getTime () {
    let d = new Date();
    let h = fill(d.getHours());
    let m = fill(d.getMinutes());
    let s = fill(d.getSeconds());

    return `${h}:${m}:${s}`; 
}

// 时间格式化
// mm:ss
export function formatTime (time, showHour = false) {
    if (time === '--') {
        return time;
    }

    var minute = Math.floor(time / 60);
    var second = Math.floor(time % 60);
    var hour = minute > 60 ? Math.floor(minute / 60) : 0;
    var time = fill(minute) + ':' + fill(second);

    if (hour || showHour) {
        time = fill(hour) + ':' + time;
    }

    return time;
}

export function fill (n) {
    return n < 10 ? '0' + n : n;
}

// 检测是否是方法
export function isFunction (param) {
    return Object.prototype.toString.call(param) === '[object Function]';
}

// 获取元素
export function q (selector, _context = document) {
    let els = _context.querySelector(selector);

    return els;
}

export function create (tagName) {
    return document.createElement(tagName);
}


// 克隆
// 支持深度克隆
export function clone (target, source, isDeep = false) {
    if (!isDeep) {
        Object.assign(target, source);
        return target;
    }

    for (let prop in source) {
        if (!source.hasOwnProperty(prop)) {
            continue;
        }

        let value = source[prop];
        if (isObject(value)) {
            target[prop] = isObject(target[prop]) ? target[prop] : {};
            clone(target[prop], value, true);

        } else if (iArray(value)) {
            target[prop] = value.concat([]);

        } else {
            target[prop] = value;
        }
    }

    return target;
}


export function isObject (param) {
    return Object.prototype.toString.call(param) === '[object Object]';
}

export function iArray (param) {
    return Array.isArray(param)
}


// 淡入，自动淡出
var _toast_key = 0;
export function toast (el, time) {
    time = time || 2000;
    el.classList.remove('toast-hide');

    clearTimeout(_toast_key);
    _toast_key = setTimeout(function () {
        el.classList.add('toast-hide');
    }, time);
}

// 全屏
// 将video容器元素全屏
export function fullscreen (element) {
    element = element || document.documentElement;
    //W3C
    if (element.requestFullscreen) {
        element.requestFullscreen();
    }
    //FireFox
    else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    }
    //Chrome等
    else if (element.webkitRequestFullScreen) {
        element.webkitRequestFullScreen();
    }
    //IE11
    else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}

export function cancelFullscreen () {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    }
    else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    }
    else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
    }
    else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}
