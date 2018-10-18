

import {isFunction, q} from './utils';

class Evts {
    constructor (el) {
        this.events = {};
        this.el = el;
    }

    on (type, selector, cb = function () {}) {
        let evtName = selector && !isFunction(selector) ? type + '--' + selector : type;
        let events = this.events[evtName];

        // 省略selector
        if (isFunction(selector)) {
            cb = selector;
        }

        let callback = function (e) {
            cb.call(e.target || this, e);
        }
        
        // 委托
        if (selector && !isFunction(selector)) {
            callback = function (e) {
                if (e === q(selector)[0]) {
                    cb.call(e.target || this, e);
                }
            }
        }

        // 第一次绑定
        if (!events) {
            events = [];
        }

        events.push(callback);
    }

    off (type, selector) {
        let evtName = selector ? type + '--' + selector : type;
        this.events[evtName] = null;
    }

    // 注入方法
    instance (_context) {
        let methods = ['on', 'off'];
        methods.forEach(method => {
            _context[method] = this[method];
        });
    }
}


export default Evts;
