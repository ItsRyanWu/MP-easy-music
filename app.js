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
    getSongSourceUrl(songId){
        // 默认码率
        let br = 320000;
        return new Promise((resolve, reject)=>{
            wx.request({
                url: `https://zeyun.org:3443/song/url?id=${songId}&br=${br}`,
                header: {'content-type':'application/json'},
                method: 'GET',
                dataType: 'json',
                responseType: 'text',
                success: (result)=>{
                    resolve(result.data.data[0].url);
                },
                fail: (err)=>{
                    reject(`获取歌曲 url 错误：${err.errMsg}`)
                },
                complete: ()=>{
                }
            });
        })
    },
    getAlbumImageUrl(songId){
        return new Promise((resolve, reject)=>{
            wx.request({
                url: `https://zeyun.org:3443/song/detail?ids=${songId}`,
                header: {'content-type':'application/json'},
                method: 'GET',
                dataType: 'json',
                responseType: 'text',
                success: (result)=>{
                    resolve(result.data.songs[0].al.picUrl);
                },
                fail: (err)=>{
                    reject(`获取专辑封面 url 错误：${err.errMsg}`)
                },
                complete: ()=>{}
            });
        })
    },
    setSongInfoToGlobalData(songObjData, songUrl, albumImageUrl){
        let songId = songObjData.songid;
        // 为自己创建的全局音乐变量设置属性
        if (songObjData.songalias){
            let songAlias = songObjData.songalias.map((item)=>{
                return item.name
            }).join(' / ');
            this.globalData.nowPlaying.songAlias = songAlias;
        }
        this.globalData.nowPlaying.songObjData = songObjData;
        this.globalData.nowPlaying.songName = songObjData.songname;
        this.globalData.nowPlaying.artistsName = songObjData.artists.map((item)=>{return item.name}).join(' / ');
        this.globalData.nowPlaying.albumName = songObjData.albumname;
        // 是否解析过专辑封面图像
        if (songUrl && albumImageUrl) {
            this.globalData.nowPlaying.songUrl = songUrl;
            this.globalData.nowPlaying.albumImageUrl = albumImageUrl;
            this.event.emit('nowPlayingChanged');
        } else {
            Promise.all([this.getSongSourceUrl(songId), this.getAlbumImageUrl(songId)])
            .then((result)=>{
                this.globalData.nowPlaying.songUrl = result[0];
                this.globalData.nowPlaying.albumImageUrl = result[1];
                this.event.emit('nowPlayingChanged'); 
            })
        }
    },
    setSongInfoToBAM(info){
        this.globalData.BackgroundAudioManager.title = info.songName;
        this.globalData.BackgroundAudioManager.singer = info.artistsName;
        this.globalData.BackgroundAudioManager.epname= info.albumName;
        this.globalData.BackgroundAudioManager.src = info.songUrl;
        this.globalData.BackgroundAudioManager.coverImgUrl = info.albumImageUrl;
    },
    playThisSong(songObjData){
        let songId = songObjData.songid;
        // 获取背景音频上下文
        let BackgroundAudioManager = this.globalData.BackgroundAudioManager;
        // 请求获取歌曲链接以及图片链接
        Promise.all([this.getSongSourceUrl(songId), this.getAlbumImageUrl(songId)])
        .then((result)=>{
            let BAMInfo = {
                songName: songObjData.songname,
                artistsName: songObjData.artists.map((item)=>{return item.name}).join(' / '),
                albumName: ` - ${songObjData.albumname}`, // hack 解决下拉菜单歌手名与专辑名没有空隙的问题
                songUrl: result[0],
                albumImageUrl: result[1]
            }
            // 为背景音频上下文设置属性
            this.setSongInfoToBAM(BAMInfo);
            // 为全局音乐变量设置属性
            this.setSongInfoToGlobalData(songObjData, result[0], result[1]);
            // 开始播放
            BackgroundAudioManager.play();
        })
    },
    startSearchingContent(searchKeyWord, currentPage){
        if (/^\s*$/.test(searchKeyWord)) return;
        wx.request({
            url: `https://zeyun.org:3443/search?keywords=${searchKeyWord}`,
            header: {'content-type':'application/json'},
            method: 'GET',
            dataType: 'json',
            responseType: 'text',
            // 搜索数据请求成功
            success: (result)=>{
                console.log(`数据请求完成：搜索关键词 ${searchKeyWord}`);
                let searchResult = result.data.result.songs;
                currentPage.setData({isSearching: false, NEMusic_SearchResult: searchResult});
            },
            fail: (err)=>{
                console.error(`数据请求失败：搜索关键词 ${searchKeyWord} ${err.errMsg}`);
            },
            complete: ()=>{}
        });
    },
    rollASongInEditorChoiceAndSync(currentPage){
        let editor_choice = wx.getStorageSync('editor-choice');
        let rollASongIndex = Math.round(Math.random()*(editor_choice.length-1));
        let songObjData = editor_choice[rollASongIndex];
        this.setSongInfoToGlobalData(songObjData);
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

