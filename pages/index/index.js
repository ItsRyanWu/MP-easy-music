//index.js
//获取应用实例
const app = getApp()
Page({
    data: {
        nowPlaying: null,
        playButtonStatus: 'to-play',
        containerBlur: null,
        searchBarValue: null,
        music_song_tips: '编辑推荐'
    },
    onLoad(){
        if (wx.getStorageInfoSync().keys.includes('editor-choice')){
            app.rollASongFromEditorChoice();
            app.requestForANewEditorChoiceAndSave().then((result)=>{
                console.log('最新编辑推荐歌单已更新并缓存')
            })
        } else {
            app.requestForANewEditorChoiceAndSave().then((result)=>{
                console.log('初始化下载编辑推荐歌单成功并缓存')
                app.rollASongInEditorChoiceAndSync(this);
            })
        }
        // 监听事件背景音乐上下文
        app.globalData.BackgroundAudioManager.onPlay(()=>{
            this.setData({playButtonStatus: 'to-pause'});
        })
        app.globalData.BackgroundAudioManager.onPause(()=>{
            this.setData({playButtonStatus: 'to-play'});
        })
        app.globalData.BackgroundAudioManager.onStop(()=>{
            this.setData({playButtonStatus: 'to-play'});
        })
        app.globalData.BackgroundAudioManager.onEnded(()=>{
            this.setData({playButtonStatus: 'to-play'});
            app.setSongInfoToBAM(this.data.nowPlaying);
        })
        app.event.on('nowPlayingChanged', this.syncGlobalNowPlaying, this)
    },
    onShow(){
        // 显示该页时同步 globalData 的 searchBar 值
        this.syncGlobalNowPlaying();
        this.setData({searchBarValue: app.globalData.searchBarValue});
    },
    switchToSearchStatus(){
        app.switchToSearchStatus(this)
    },
    switchToNormalStatus(){
        app.switchToNormalStatus(this)
    },
    syncValueToGlobalData(event){
        app.syncValueToGlobalData(event)
    },
    getSearchKeyWordAndNavigatingToSearchResult(){
        let searchKeyWord = app.getSearchKeyWord();
        if (!searchKeyWord || /^\s*$/.test(searchKeyWord)) return;
        wx.navigateTo({
            url: `../search-result/search-result?search=${searchKeyWord}`
        });
    },
    syncGlobalNowPlaying(){
        this.setData({nowPlaying: app.globalData.nowPlaying})
    },
    switchPlayPause(){
        if (app.globalData.BackgroundAudioManager.paused == undefined ){
            // 歌曲初始化状态
            app.playThisSong(app.globalData.nowPlaying.songObjData);
        } else if (app.globalData.BackgroundAudioManager.paused){
            // 歌曲暂停或已播放完毕状态
            app.globalData.BackgroundAudioManager.play();
        }
        else {
            // 歌曲正在播放状态
            app.globalData.BackgroundAudioManager.pause();
        }
    }
})
