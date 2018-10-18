
import { getTime, deviceInfo } from './utils';

const device = deviceInfo();
const _self = typeof window !== 'undefined' ? window : (global || this);
const log = _self.console || {
    log: function () {},
    info: function () {},
    warn: function () {},
    error: function () {}
};


// 日志级别配置
const config = {
    info: 'log|info|warn|error|alert',
    warn: 'warn|error|alert',
    error: 'error|alert',
    alert: 'alert'
}


class Log {
    constructor (prefix = 'out', debug = true) {
        this.debug = debug === true ? 'info' : debug;
        this.prefix = prefix;

        if (debug && !config[debug]) {
            this.debug = 'info';
        }

        config.info.split('|').forEach(method => {
            let _this = this;
            _this[method] = function () {
                let args = Array.from(arguments);
                args.unshift(method);
                _this.out(...args);
            }
        });
    }

    // type, msg1, msg2, ...
    out () {
        if (!this.debug) {
            return;
        }
        
        let args = Array.from(arguments);
        let type = args.shift();
        let action = log[type] || _self[type];

        // 是否在控制级别内
        if (!config[this.debug].split('|').includes(type)) {
            return;
        }

        args.unshift(this.prefix + '::' + getTime());
        if (type === 'alert') {
            args = [args.join('---')];
        }

        if (_self.hasOwnProperty(type) || log.hasOwnProperty(type)) {
            action.apply(null, args);
        }
    }

    // 注入方法
    instance (context) {
        let methods = config.info.split('|') || [];
        methods.forEach(method => {
            context[method] = this[method];
        });
    }
}

export default Log;
