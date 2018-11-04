//index.js
//获取应用实例
const app = getApp()
Page({
    data: {
        nowPlaying:{
            songName: null,
            artistsName: null,
            songAlias: null,
            albumName: null,
            albumImageUrl: null
        },
        playButtonStatus: 'to-play',
        containerBlur: null,
        searchBarValue: null
    },
    onLoad(){
        if (wx.getStorageInfoSync().keys.includes('editor-choice')){
            app.rollASongInEditorChoiceAndSync(this);
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
        if (app.globalData.BackgroundAudioManager.paused || app.globalData.BackgroundAudioManager.paused == undefined){
            app.playThisSong(app.globalData.nowPlaying.songObjData);
            this.syncGlobalNowPlaying();
        } else {
            app.globalData.BackgroundAudioManager.pause();
        }
    }
})
