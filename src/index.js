

import Log from './js/log';
import Evts from './js/evts';
import iVideo from './js/video';

import './style/video.scss';

let log = new Log('iVideo', true);
// let evt = new Evts();
// log.warn('ddd');

// 混入
iVideo.use(log);

let _this = typeof window !== 'undefined' ? window : this;
_this.iVideo = iVideo;
