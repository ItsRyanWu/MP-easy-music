//获取应用实例
const app = getApp()
Page({
    data: {
        source: 'netease',
        netease: null,
        qq: null,
        isSearchBoxFoucs: false,
        searchBarValue: null,
        isSearching: false,
        isBlur: false
    },
    onLoad(redirectParameters){
        // 显示该页时同步 globalData 的 searchBar 值
        this.setData({searchBarValue: app.globalData.searchBarValue});
        if('search' in redirectParameters){
            console.log('result-page: 接收到搜索命令，开始搜索。')
            let searchKeyWord = redirectParameters.search;
            this.startSearchingContent(searchKeyWord);
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
        this.setData({source: 'netease'}) 
        if(!this.data.netease){
            this.startSearchingContent(app.globalData.searchBarValue);
        }
    },
    switchToQQMusic(){
        this.setData({source: 'qq'})
        if(!this.data.qq){
            this.startSearchingContent(app.globalData.searchBarValue);
        }
    },
    startSearchingContent(searchKeyWord){
        this.setData({isSearching: true});
        this.setData({searchBarValue: searchKeyWord});
        let source = this.data.source
        wx.request({
            url: `https://zeyun.org:3444/api/search/song/${source}?key=${searchKeyWord}&limit=30&page=1`,
            header: {'content-type':'application/json'},
            method: 'GET',
            dataType: 'json',
            responseType: 'text',
            // 搜索数据请求成功
            success: (result)=>{
                console.log(`数据请求完成：${source} 搜索关键词 ${searchKeyWord}`);
                let searchResult = result.data.songList;
                this.setData({isSearching: false, [source]: searchResult});
            },
            fail: (err)=>{
                console.error(`数据请求失败：${source} 搜索关键词 ${searchKeyWord} ${err.errMsg}`);
            },
            complete: ()=>{}
        }); 
    },
    cleanSearchData(source){
        if(!source){
            this.setData({qq: null, netease:null})
        } else {
            this.setData({[source]: null})
        }
    },
    startSearchInSRPage(){
        let searchKeyWord = app.getSearchKeyWord();
        if (!searchKeyWord || /^\s*$/.test(searchKeyWord)) return;
        this.cleanSearchData();
        this.startSearchingContent(searchKeyWord);
    },
    longpressToShowJSON(event){
        if (app.globalData.debug) {
            let dataset = event.currentTarget.dataset;
            console.log(JSON.stringify(dataset));
        } 
    },
    playThisSong(event){
        let dataset = event.currentTarget.dataset;
        app.playThisSong(dataset);
    }
})
