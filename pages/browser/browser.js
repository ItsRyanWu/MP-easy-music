//获取应用实例
const app = getApp()
Page({
    data: {
        NEMusic_NewSongChart: null,
        searchBarBottom: null,
        containerBlur: null,
        searchBarValue: null,
        isFocus: false
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
    },
    switchToSearchStatus(){
        // 激活 serchBar 时向上移动方便打字
        this.setData({searchBarBottom: '80%'})
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
            // wx.removeStorageSync('NEMusic_SearchResult');
            this.setData({searchBarValue: null})
        }
    },
    syncValueToGlobalData(event){
        // 监听输入事件同步 serchBar 值至全局变量
        app.globalData.searchBarValue = event.detail.value;
    },
    startSearchingAndNavigatingToSearchResult(){
        let searchKeyWord = app.globalData.searchBarValue;
        if (!searchKeyWord || /^\s*$/.test(searchKeyWord)) return;
        wx.navigateTo({
            url: `../search-result/search-result?search=${searchKeyWord}`
        });
    }
})
