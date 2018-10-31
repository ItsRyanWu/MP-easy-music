//获取应用实例
const app = getApp()
Page({
    data: {
        NEMusic_NewSongChart: null,
        NEMusic_SearchResult: null,
        searchBarBottom: null,
        containerBlur: null,
        searchBarValue: null,
        isFocus: false,
        isSearching: false
    },
    onShow(){
        // 显示该页时同步 globalData 的 searchBar 值
        this.setData({searchBarValue: app.globalData.searchBarValue});
        // 首先试图读取储存中是否存在搜索结果
        try {
            console.log(`试图获取存储中的搜索数据`);
            var searchResultInStorage = wx.getStorageSync('NEMusic_SearchResult'); 
            // console.log(wx.getStorageInfoSync());
            // console.log(wx.getStorageSync('NEMusic_SearchResult')) 
        } catch (err) {
            console.log(`读取数据失败：网易云音乐搜索结果 ${err.errMsg}`);
        }
        // 如果储存中有搜索结果则对变量赋值，页面显示搜索结果
        if (searchResultInStorage){
            console.log('已读取到存储中的搜索数据')
            this.setData({NEMusic_SearchResult: searchResultInStorage})
        } else {
        // 如果储存中没有搜索结果，读取储存中的排行榜数据，对变量赋值，页面显示默认排行榜 
            console.log('未读取到存储中的搜索数据')
            try {
                var NEMusic_NewSongChart = wx.getStorageSync('NEMusic_NewSongChart');
                console.log(`读取数据成功：网易云音乐新歌榜`)
            } catch (err) {
                console.log(`读取数据失败：网易云音乐新歌榜 ${err.errMsg}`)
            }
            this.setData({NEMusic_NewSongChart: NEMusic_NewSongChart})
        }
    },
    onHide(){
        // 离开该页时清空该页 serchBar 值 
        this.setData({searchBarValue: null});
    },
    switchToSearchStatus(){
        // 激活 serchBar 时向上移动方便打字
        this.setData({searchBarBottom: '70%'})
        // 激活 serchBar 时 blur 主页面
        this.setData({containerBlur: 'blur(13rpx)'});
        this.setData({isFocus: true})
    },
    switchToNormalStatus(){
        this.setData({isFocus: false})
        // 取消激活 serchBar 恢复原来位置
        this.setData({searchBarBottom: null})
        // 取消激活 serchBar 时取消 blur 主页面
        this.setData({containerBlur: null});
        // 如果搜索栏为空则清空所有搜索数据，初始化为未搜索状态
        if (!app.globalData.searchBarValue || /^\s*$/.test(app.globalData.searchBarValue)) {
            console.log('搜索栏已空，清除所有搜索数据');
            wx.removeStorageSync('NEMusic_SearchResult');
            this.setData({searchBarValue: null, NEMusic_SearchResult: ''})
        }
    },
    syncValueToGlobalData(event){
        // 监听输入事件同步 serchBar 值至全局变量
        app.globalData.searchBarValue = event.detail.value;
    },
    startSearchingContent(){
        let searchKeyWord = app.globalData.searchBarValue;
        if (!searchKeyWord || /^\s*$/.test(searchKeyWord)) return;
        this.setData({isSearching: true});
        app.startSearchingContent(searchKeyWord);
    }
})
