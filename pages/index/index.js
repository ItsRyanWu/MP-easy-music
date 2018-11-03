//index.js
//获取应用实例
const app = getApp()
Page({
    data: {
        nowPlaying:{
            songName: null,
            artistsName: null,
            albumName: null,
            albumImageUrl: null
        },
        playButtonStatus: 'to-play',
        containerBlur: null,
        searchBarValue: null
    },
    onLoad(){
        app.globalData.BackgroundAudioManager.onPlay(()=>{
            this.setData({playButtonStatus: 'to-pause'});
        })
        app.globalData.BackgroundAudioManager.onPause(()=>{
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
        if (app.globalData.BackgroundAudioManager.paused){
            app.globalData.BackgroundAudioManager.play();
        } else {
            app.globalData.BackgroundAudioManager.pause();
        }
    }
})
