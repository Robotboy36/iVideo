
import './style/index.scss';

let localMedia = require('./media/chazuo.mp4');
let player = null;
let curIndex = 0;
let data = [
    {title: '插座test', src: localMedia},
    {title: '热血火影', src: 'http://videohy.tc.qq.com/vcloud1049.tc.qq.com/1049_M0100505004VsPqN22auPb1001050067.f20.mp4?vkey=3E7780DD33B7B1D0BEFDA11BFF170CAFA1BB81DC66FB26554598CD2A3DC2D2C683E3A8B01D61A90CEE6B3E6BC6EF900FC312DA13BA62A4584B09B381154B5D046025EAF301F695C94049B01E808AFE28F2FE345A49DACB4D&ocid=248782764'},
    {title: '漩涡博人豪杰物语', src: 'http://vliveachy.tc.qq.com/vcloud1049.tc.qq.com/1049_F0101944000jDy2M3WUmgW1000804586.f40.mp4?vkey=4BBB30A685D372FC961B23E840AD334AF61FD18EB5176BB8217D2A3AC6E814CDBE5E94D3B9E1E9634A0BBA52A629CFDC7701CBAA2A24F5427373176231287F0A290D31C7E37084CE1C997ADF65EE2734442255228FA22B14&ocid=2675316140&ocid=2483033260'},
    {title: '火影十大悲伤向BGM排行榜', src: 'http://14.215.93.160/vcloud1049.tc.qq.com/1049_F0100414000EQs6W3tvqQq1000598974.f20.mp4?vkey=B8151BF100FFB2A1A7C096589DCC31FC2EE24C9B3CE5B0FB7A9F771E66984BBD61460D32B180001D9BD369634DA8693EB1FD6F8B23B3F4FADF2BA33DA8BD97680517E2814A7F8DE1421BAAC59BADE38551A62A7470D35779'},
    {title: '宇智波斑.降临', src: 'http://videohy.tc.qq.com/vcloud1049.tc.qq.com/1049_F0101571002hcLKJ13sfRX1000844354.f20.mp4?vkey=168AFA81C13A2ED950A796590FD2DD72E27151B79B4F238281727335FF4A44045BDE70D648F5C7CB4A8F0E1B347E560B826A37A4CA35072B00FBAA6A7A0E71CC03E1509441DBBA4CDD1C083636C612F6F957495D23D67A82&ocid=786438316'},
    {title: '火影-迈特凯《青春》', src: 'http://vliveachy.tc.qq.com/vcloud1049.tc.qq.com/1049_F0101378004O22jW3M4YlU1000992357.f30.mp4?vkey=424CF548EA686FF314C3B1571A4CC393BCD1267A74C07779B43FAB58351A74CA3DB548B3D53A9A25BB59333358BAB63190F3AC4A7145F0F08188E72B84522E626BC79A3C3FD199450EAA8887E271FF1F94C90131D80DF630&ocid=457971116&ocid=2399147180'},
    {title: '新人向之火影', src: 'http://vliveachy.tc.qq.com/vcloud1049.tc.qq.com/1049_F010162500287Zy63fFKMX1000972342.f20.mp4?vkey=FD19C4690502A6BEB3BC068FFD9B2F07C1C5C49F3BB8F583024121E803EB4D0B925F89F1EBA6A082CE509B19E4DECA0C8DB3D7325928A18E9ACDF157C6DCEEAB1C0E132CDD0A787C1200160359A51535E1F61BFDBD5FC125&ocid=2568885676&ocid=2399147180'}
]

function init () {
    render();
    evts();

    // // 初始化播放器
    player = new iVideo('.ivideo-container', {
        src: {
            src: data[0].src,
            title: data[0].title
        }
    });

    player.on('ended', next);
}

function next () {
    curIndex++;
    
    if (curIndex === data.length) {
        curIndex = 0;
    }

    render();
}

function evts () {
    let list = document.querySelector('.play-list');

    list.addEventListener('touchstart', function(e){
        if (e.target.tagName === 'LI') {
            e.target.classList.add('touch');
        }
    }, false);

    list.addEventListener('touchend', function(e){
        let el = e.target;
        if (el.tagName === 'LI') {
            el.classList.remove('touch');                    
            curIndex = el.getAttribute('data-index') - 0;

            player.src({
                src: data[curIndex].src,
                title: data[curIndex].title
            });
            render();
        }
    }, false);
}


function render () {
    let list = document.querySelector('.play-list');
    let html = '';
    data.forEach(function(item, index){
        html += '<li data-index="' + index + '"';
        html += index === curIndex ? ' class="active"': '';
        html += '>' + item.title + '</li>';
    });
    list.innerHTML = html;
}

window.addEventListener('load', init);
window.addEventListener('error', function (e) {
    let msg = 'msg: ' + e.message + '\n';
    msg += 'filename: ' + e.filename + '\n';
    msg += 'lineno: ' + e.lineno + '\n';
    msg += 'colno: ' + e.colno + '\n';
    msg += 'error: ' + e.error;
    alert(msg);
})