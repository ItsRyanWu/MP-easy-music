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
        searchBarBottom: null,
        containerBlur: null,
        searchBarValue: null,
        isFocus: false
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
    }
})
