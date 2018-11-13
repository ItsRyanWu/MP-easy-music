//获取应用实例
const app = getApp()
Page({
    data: {
        editorChoiceData: null,
        isSearchBoxFoucs: false,
        searchBarValue: null,
        isBlur: false
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
    playThisSong(event){
        let dataset = event.currentTarget.dataset;
        // console.log(dataset)
        app.playThisSong(dataset);
    }
})
