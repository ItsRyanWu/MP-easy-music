//获取应用实例
const app = getApp()
Page({
    data: {
        editorChoiceData: null,
        isSearchBoxFoucs: false,
        searchBarValue: null
    },
    onShow(){
        // 显示该页时同步 globalData 的 searchBar 值
        this.setData({searchBarValue: app.globalData.searchBarValue});
        try {
            var editorChoiceData = wx.getStorageSync('editor-choice');
            console.log(`读取数据成功：编辑推荐歌单`)
        } catch (err) {
            console.log(`读取数据失败：编辑推荐歌单 ${err.errMsg}`)
        }
        this.setData({editorChoiceData})
    },
    focusSearchBox(){
        this.setData({isSearchBoxFoucs: true})
    },
    unfocusSearchBox(){
        this.setData({isSearchBoxFoucs: false})
        // 如果搜索栏为空则清空所有搜索数据，初始化为未搜索状态
        let globalSearchBarValue = app.globalData.searchBarValue;
        if (!globalSearchBarValue || /^\s*$/.test(globalSearchBarValue)) {
            console.log('搜索栏已空，清除所有搜索数据');
            this.setData({searchBarValue: null})
        }
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
        let dataset = event.currentTarget.dataset;
        console.log(dataset)
        app.playThisSong(dataset);
    },
})
