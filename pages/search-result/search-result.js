//获取应用实例
const app = getApp()
Page({
    data: {
        NEMusic_SearchResult: null,
        containerBlur: null,
        searchBarValue: null,
        isSearching: false
    },
    onLoad(redirectParameters){
        // 显示该页时同步 globalData 的 searchBar 值
        this.setData({searchBarValue: app.globalData.searchBarValue});
        if('search' in redirectParameters){
            console.log('result-page: 接收到搜索命令，开始搜索。')
            this.getSearchKeyWordAndStartSearchingContent();
        }
    },
    onShow(){
        // // 首先试图读取储存中是否存在搜索结果
        // try {
        // console.log(`试图获取存储中的搜索数据`);
        // var searchResultInStorage = wx.getStorageSync('NEMusic_SearchResult'); 
        // // console.log(wx.getStorageInfoSync());
        // // console.log(wx.getStorageSync('NEMusic_SearchResult')) 
        // } catch (err) {
        // console.log(`读取数据失败：网易云音乐搜索结果 ${err.errMsg}`);
        // }
        // // 如果储存中有搜索结果则对变量赋值，页面显示搜索结果
        // if (searchResultInStorage){
        //     console.log('已读取到存储中的搜索数据')
        //     this.setData({NEMusic_SearchResult: searchResultInStorage})
        // } 
    },
    onUnload(){
        // 离开搜索页时清空 serchBar 值 
        app.globalData.searchBarValue = null;
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
    getSearchKeyWordAndStartSearchingContent(){
        let searchKeyWord = app.getSearchKeyWord();
        if (!searchKeyWord || /^\s*$/.test(searchKeyWord)) return;
        this.setData({isSearching: true});
        app.startSearchingContent(searchKeyWord, this);
    },
    playThisSong(event){
        app.playThisSong(event)
    }
})
