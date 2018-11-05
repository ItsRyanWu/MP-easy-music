//获取应用实例
const app = getApp()
Page({
    data: {
        whichMusicSourceSelected: 'NEMusic',
        NEMusic_NewSongChart: null,
        QQMusic_SuggestAlbumChart: null,
        containerBlur: null,
        searchBarValue: null
    },
    onShow(){
        // 显示该页时同步 globalData 的 searchBar 值
        this.setData({searchBarValue: app.globalData.searchBarValue});
        try {
            var NEMusic_NewSongChart = wx.getStorageSync('NEMusic_NewSongChart');
            console.log(`读取数据成功：网易云音乐新歌榜`)
        } catch (err) {
            console.log(`读取数据失败：网易云音乐新歌榜 ${err.errMsg}`)
        }
        this.setData({NEMusic_NewSongChart: NEMusic_NewSongChart})
        try {
            var QQMusic_SuggestAlbumChart = wx.getStorageSync('QQMusic_SuggestAlbumChart');
            console.log(`读取数据成功：网易云音乐新歌榜`)
        } catch (err) {
            console.log(`读取数据失败：网易云音乐新歌榜 ${err.errMsg}`)
        }
        this.setData({QQMusic_SuggestAlbumChart: QQMusic_SuggestAlbumChart})
    },
    switchToNEMusic(){
        this.setData({whichMusicSourceSelected: 'NEMusic'}) 
    },
    switchToQQMusic(){
        this.setData({whichMusicSourceSelected: 'QQMusic'}) 
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
    playThisSong(event){
        let songTextData = event.currentTarget.dataset;
        app.playThisSong(songTextData);
    },
})
