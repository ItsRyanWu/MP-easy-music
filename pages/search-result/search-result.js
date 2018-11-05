//获取应用实例
const app = getApp()
Page({
    data: {
        whichMusicSourceSelected: 'NEMusic',
        NEMusic_SearchResult: null,
        QQMusic_SearchResult: null,
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
    switchToNEMusic(){
        this.setData({whichMusicSourceSelected: 'NEMusic'}) 
    },
    switchToQQMusic(){
        this.setData({whichMusicSourceSelected: 'QQMusic'})
        if (!this.data.QQMusic_SearchResult){
            this.getSearchKeyWordAndStartSearchingContent();
        }
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
    startSearchingContent(searchKeyWord){
        if (/^\s*$/.test(searchKeyWord)) return;
        if (this.data.whichMusicSourceSelected === 'NEMusic'){
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
                    this.setData({isSearching: false, NEMusic_SearchResult: searchResult});
                },
                fail: (err)=>{
                    console.error(`数据请求失败：搜索关键词 ${searchKeyWord} ${err.errMsg}`);
                },
                complete: ()=>{}
            });
        } else {
            wx.request({
                url: `https://zeyun.org:3444/api/search/song/qq?key=${searchKeyWord}&limit=20&page=1`,
                header: {'content-type':'application/json'},
                method: 'GET',
                dataType: 'json',
                responseType: 'text',
                // 搜索数据请求成功
                success: (result)=>{
                    console.log(`数据请求完成：搜索关键词 ${searchKeyWord}`);
                    let searchResult = result.data.songList;
                    this.setData({isSearching: false, QQMusic_SearchResult: searchResult});
                },
                fail: (err)=>{
                    console.error(`数据请求失败：搜索关键词 ${searchKeyWord} ${err.errMsg}`);
                },
                complete: ()=>{}
            });
        }
    },
    getSearchKeyWordAndStartSearchingContent(){
        let searchKeyWord = app.getSearchKeyWord();
        if (!searchKeyWord || /^\s*$/.test(searchKeyWord)) return;
        this.setData({isSearching: true});
        this.startSearchingContent(searchKeyWord);
    },
    longpressToShowJSON(event){
        if (app.globalData.debug) {
            let songTextData = event.currentTarget.dataset;
            console.log(JSON.stringify(songTextData));
        }
    },
    playThisSong(event){
        let songObjData = event.currentTarget.dataset;
        app.playThisSong(songObjData);
    }
})
