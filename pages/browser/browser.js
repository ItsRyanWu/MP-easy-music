//获取应用实例
const app = getApp()
Page({
    data: {
        searchBarValue: null,
        NEMusic: null
    },
    onReady(){
        this.setData({NEMusic: app.globalData.NEMusic})
    },
    onShow(){
        // 显示该页时同步 globalData 的 searchBar 值
        this.setData({searchBarValue: app.globalData.searchBarValue})
    },
    onHide(){
        // 离开该页时清空该页 serchBar 值 
        this.setData({searchBarValue: null});
    }
})
