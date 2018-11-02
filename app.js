var utils = require('/utils/util');
//app.js
App({
    globalData: {
        nowPlaying:{
            songName: '年少有为',
            artistsName: '李荣浩',
            albumName: '耳朵',
            albumImageUrl: 'http://p2.music.126.net/tt8xwK-ASC2iqXNUXYKoDQ==/109951163606377163.jpg'
        },
        searchBarValue: null
    },
    onLaunch(){
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
    },
    switchToSearchStatus(currentPage){
        // 激活 serchBar 时向上移动方便打字
        currentPage.setData({searchBarBottom: '80%'})
        // 激活 serchBar 时 blur 主页面
        currentPage.setData({containerBlur: 'blur(13rpx)'});
        currentPage.setData({isFocus: true})
    },
    switchToNormalStatus(currentPage){
        currentPage.setData({isFocus: false})
        // 取消激活 serchBar 恢复原来位置
        currentPage.setData({searchBarBottom: null})
        // 取消激活 serchBar 时取消 blur 主页面
        currentPage.setData({containerBlur: null});
        // 如果搜索栏为空则清空所有搜索数据，初始化为未搜索状态
        if (!this.globalData.searchBarValue || /^\s*$/.test(this.globalData.searchBarValue)) {
            console.log('搜索栏已空，清除所有搜索数据');
            // wx.removeStorageSync('NEMusic_SearchResult');
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
    playThisSong(event){
        // 获取背景音频上下文
        let BackgroundAudioManager = wx.getBackgroundAudioManager();
        // 解析关键参数
        let songTextData = event.currentTarget.dataset;
        let songId = songTextData.songid;
        let songName = songTextData.songname;
        let albumName = songTextData.albumname;
        let artistsName = songTextData.artists.map((item)=>{
            return item.name
        }).join(' / ')
        // 为背景音频上下文设置属性
        BackgroundAudioManager.title = songName;
        BackgroundAudioManager.singer = artistsName;
        BackgroundAudioManager.epname = albumName;
        // 为全局音乐变量设置属性
        this.globalData.nowPlaying.songName = songName;
        this.globalData.nowPlaying.artistsName = artistsName;
        this.globalData.nowPlaying.albumName = albumName;
        // 请求获取歌曲链接以及图片链接
        Promise.all([this.getSongSourceUrl(songId), this.getAlbumImageUrl(songId)])
        .then((result)=>{
            // 已获取歌曲链接以及图片链接
            let songSourceUrl = result[0];
            let albumImageUrl = result[1];
            // 为背景音频上下文设置属性
            BackgroundAudioManager.src = songSourceUrl;
            BackgroundAudioManager.coverImgUrl = albumImageUrl;
            // 为全局音乐变量设置属性
            this.globalData.nowPlaying.albumImageUrl = albumImageUrl;
            // 开始播放
            BackgroundAudioManager.play();
        })
    },
    startSearchingContent(searchKeyWord, currentPage){
        if (/^\s*$/.test(searchKeyWord)) return;
        var reqTask = wx.request({
            url: `https://zeyun.org:3443/search?keywords=${searchKeyWord}`,
            header: {'content-type':'application/json'},
            method: 'GET',
            dataType: 'json',
            responseType: 'text',
            // 搜索数据请求成功
            success: (result)=>{
                console.log(`数据请求完成：搜索关键词 ${searchKeyWord}`);
                let searchResult = result.data.result.songs;
                // 将数据存入缓存
                // wx.setStorage({
                //     key: 'NEMusic_SearchResult',
                //     data: searchResult,
                //     success: ()=>{
                //         console.log(`数据储存完成：搜索关键词 ${searchKeyWord} `)
                        // console.log(wx.getStorageInfoSync());
                        // console.log(wx.getStorageSync('NEMusic_SearchResult')) 
                    // },
                    // fail: (err)=>{
                    //     console.error(`数据储存失败：搜索关键词 ${searchKeyWord} ${err.errMsg}`)
                    // },
                    // complete: ()=>{
                // let searchResultInStorage = wx.getStorageSync('NEMusic_SearchResult'); 
                currentPage.setData({isSearching: false, NEMusic_SearchResult: searchResult})
                    // }
                // });
            },
            fail: (err)=>{
                console.error(`数据请求失败：搜索关键词 ${searchKeyWord} ${err.errMsg}`)
            },
            complete: ()=>{}
        });
    }
//   onLaunch: function () {
    // 展示本地存储能力
    // var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)

    // 登录
    // wx.login({
    //   success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
    //   }
    // })
    // 获取用户信息
    // wx.getSetting({
    //   success: res => {
    //     if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
        //   wx.getUserInfo({
        //     success: res => {
              // 可以将 res 发送给后台解码出 unionId
            //   this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
            //   if (this.userInfoReadyCallback) {
    //             this.userInfoReadyCallback(res)
    //           }
    //         }
    //       })
    //     }
    //   }
    // })
//   },
})

