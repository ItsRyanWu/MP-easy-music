//index.js
//获取应用实例
const app = getApp()
Page({
    data: {
        albumImageSrc: 'http://p2.music.126.net/ACPwGpJZxmGKnM3rWilemA==/109951163083048605.jpg',
        song: '永不失联的爱',
        singer: '周兴哲',
        album: '如果雨之后',
        searchBarBottom: null,
        containerBlur: null,
        searchBarValue: null,
        isFocus: false
    },
    onShow(){
        // 显示该页时同步 globalData 的 searchBar 值
        this.setData({searchBarValue: app.globalData.searchBarValue});
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
        // 监听输入事件同步 searchBar 值至全局变量
        app.globalData.searchBarValue = event.detail.value;
    },
    navigateToSearchResult(){
        wx.navigateTo({
            url: `../search-result/search-result`,
            success(){
                let currentPages = getCurrentPages();
                if (currentPages[currentPages.length-1].route === 'pages/search-result/search-result'){
                    let searchResult = currentPages[currentPages.length-1];
                    searchResult.setData({isSearching: true})
                } else {
                    console.log('currentPages 不是 search-result')
                }
            }
        });
    },
    startSearchingAndNavigatingToSearchResult(){
        let searchKeyWord = app.globalData.searchBarValue;
        if (!searchKeyWord || /^\s*$/.test(searchKeyWord)) return;
        this.navigateToSearchResult();
        app.startSearchingContent(searchKeyWord);
    }
})
