const utils = require('./utils/util.js');
const Event = utils.Event
//app.js
App({
    globalData: {
        nowPlaying:{
            songName: null,
            artistsName: null,
            albumName: null,
            songUrl: null,
            albumImageUrl: null,
            songAlias: null,
            songObjData: null,
        },
        searchBarValue: null,
        BackgroundAudioManager: null,
        debug: true
    },
    event: new Event(),
    onLaunch(){
        // 请求排行榜数据
        wx.request({
            url: 'https://zeyun.org:3443/top/list?idx=0',
            header: {'content-type':'application/json'},
            method: 'GET',
            dataType: 'json',
            responseType: 'text',
            success: (result)=>{
                console.log('数据请求完成：网易云音乐新歌榜')
                wx.setStorage({
                    key: 'NEMusic_NewSongChart',
                    data: result.data.playlist.tracks,
                    success: ()=>{
                        console.log('数据储存完成：网易云音乐新歌榜')
                    },
                    fail: (err)=>{
                        console.error(`数据储存失败：网易云音乐新歌榜 ${err.errMsg}`)
                    },
                    complete: ()=>{}
                });
            },
            fail: (err)=>{
                console.error(`数据请求失败：网易云音乐新歌榜 ${err.errMsg}`)
            }
        });
        wx.request({
            url: 'https://zeyun.org:3444/api/suggest/album/qq?limit=30',
            header: {'content-type':'application/json'},
            method: 'GET',
            dataType: 'json',
            responseType: 'text',
            success: (result)=>{
                console.log('数据请求完成：QQ 音乐建议专辑榜')
                wx.setStorage({
                    key: 'QQMusic_SuggestAlbumChart',
                    data: result.data.albumList,
                    success: ()=>{
                        console.log('数据储存完成：QQ 音乐建议专辑榜')
                    },
                    fail: (err)=>{
                        console.error(`数据储存失败：QQ 音乐建议专辑榜 ${err.errMsg}`)
                    },
                    complete: ()=>{}
                });
            },
            fail: (err)=>{
                console.error(`数据请求失败：QQ 音乐建议专辑榜 ${err.errMsg}`)
            }
        });
        this.globalData.BackgroundAudioManager = wx.getBackgroundAudioManager();
    },
    switchToSearchStatus(currentPage){
        // 激活 serchBar 时 blur 主页面
        currentPage.setData({containerBlur: 'blur(40rpx) saturate(150%)'});
    },
    switchToNormalStatus(currentPage){
        // 取消激活 serchBar 时取消 blur 主页面
        currentPage.setData({containerBlur: null});
        // 如果搜索栏为空则清空所有搜索数据，初始化为未搜索状态
        if (!this.globalData.searchBarValue || /^\s*$/.test(this.globalData.searchBarValue)) {
            console.log('搜索栏已空，清除所有搜索数据');
            currentPage.setData({searchBarValue: null})
        }
    },
    syncValueToGlobalData(event){
        // 监听输入事件同步 serchBar 值至全局变量
        this.globalData.searchBarValue = event.detail.value;
    },
    getSearchKeyWord(){
        let searchKeyWord = this.globalData.searchBarValue;
        return searchKeyWord;
    },
    getSongSourceUrl(songId, source){
        // 默认码率
        // let br = 320000;
        return new Promise((resolve, reject)=>{
            wx.request({
                url: `https://zeyun.org:3444/api/get/song/${source}?id=${songId}`,
                header: {'content-type':'application/json'},
                method: 'GET',
                dataType: 'json',
                responseType: 'text',
                success: (result)=>{
                    resolve(result.data.url);
                },
                fail: (err)=>{
                    reject(`获取歌曲 url 错误：${err.errMsg}`)
                },
                complete: ()=>{
                }
            });
        })
    },
    // getAlbumImageUrl(songId){
    //     return new Promise((resolve, reject)=>{
    //         wx.request({
    //             url: `https://zeyun.org:3443/song/detail?ids=${songId}`,
    //             header: {'content-type':'application/json'},
    //             method: 'GET',
    //             dataType: 'json',
    //             responseType: 'text',
    //             success: (result)=>{
    //                 resolve(result.data.songs[0].al.picUrl);
    //             },
    //             fail: (err)=>{
    //                 reject(`获取专辑封面 url 错误：${err.errMsg}`)
    //             },
    //             complete: ()=>{}
    //         });
    //     })
    // },
    setSongInfoToGlobalData(songData, source, url){
        let songId = songData.id;
        // 如果已经解析过 songUrl
        if (!url) {
            // 为自己创建的全局音乐变量设置属性
            this.globalData.nowPlaying = {
                songData,
                source
            }
            this.getSongSourceUrl(songId, source)
            .then(url=>{
                this.globalData.nowPlaying.url = url;
                this.event.emit('nowPlayingChanged'); 
            })
            return;
        } 
        // 为自己创建的全局音乐变量设置属性
        this.globalData.nowPlaying = {
            songData,
            source,
            url
        }
        // 发布变更消息
        this.event.emit('nowPlayingChanged');
    },
    setSongInfoToBAM(songData, url){
        let info = {
            songName: songData.name,
            artistsName: songData.artists.map(item => item.name).join(' / '),
            albumName: ` - ${songData.album.name}`, // hack 解决下拉菜单歌手名与专辑名没有空隙的问题
            songUrl: url,
            albumImage_small: songData.album.coverSmall
        }
        this.globalData.BackgroundAudioManager.title = info.songName;
        this.globalData.BackgroundAudioManager.singer = info.artistsName;
        this.globalData.BackgroundAudioManager.epname= info.albumName;
        this.globalData.BackgroundAudioManager.src = info.songUrl;
        this.globalData.BackgroundAudioManager.coverImgUrl = info.albumImage_small;
    },
    playThisSong(songData, source, url){
        let songId = songData.id;
        // 请求获取歌曲链接以及图片链接
        if (!url){
            this.getSongSourceUrl(songId, source)
            .then((url)=>{
                // 为背景音频上下文设置属性
                this.setSongInfoToBAM(songData, url);
                // 为全局音乐变量设置属性
                this.setSongInfoToGlobalData(songData, source, url);
            })
            return;
        }
        // 为背景音频上下文设置属性
        this.setSongInfoToBAM(songData, url);
        // 为全局音乐变量设置属性
        this.setSongInfoToGlobalData(songData, source, url);
    },
    rollASongFromEditorChoice(){
        let editor_choice = wx.getStorageSync('editor-choice');
        let rollASongIndex = Math.round(Math.random()*(editor_choice.length-1));
        let rollResultData = editor_choice[rollASongIndex];
        console.log(rollResultData);
        this.setSongInfoToGlobalData(rollResultData.songData, rollResultData.source);
    },
    requestForANewEditorChoiceAndSave(){
        return new Promise((resolve, reject)=>{
            // 请求编辑推荐歌单数据
            wx.request({
                url: 'https://zeyun.org/easy-music/editor-choice.json',
                header: {'content-type':'application/json'},
                method: 'GET',
                dataType: 'json',
                responseType: 'text',
                success: (result)=>{
                    console.log('数据请求完成：编辑推荐歌单')
                    wx.setStorage({
                        key: 'editor-choice',
                        data: result.data,
                        success: ()=>{
                            console.log('数据储存完成：编辑推荐歌单');
                            resolve('done');
                        },
                        fail: (err)=>{
                            console.error(`数据储存失败：编辑推荐歌单 ${err.errMsg}`)
                        },
                        complete: ()=>{}
                    });
                },
                fail: (err)=>{
                    console.error(`数据请求失败：编辑推荐歌单 ${err.errMsg}`)
                },
                complete: ()=>{}
            });
        })
    }
})

