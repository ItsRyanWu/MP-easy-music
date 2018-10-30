//index.js
//获取应用实例
const app = getApp()
Page({
    data: {
        albumImageSrc: 'http://p2.music.126.net/ACPwGpJZxmGKnM3rWilemA==/109951163083048605.jpg',
        song: '永不失联的爱',
        singer: '周兴哲',
        album: '如果雨之后',
        containerBlur: null,
        searchBarValue: null
    },
    testCloudMusic(){
        let options = {
          url: 'https://zeyun.org:3443/search?keywords=永不失联的爱',
          header: {'content-type':'application/json'},
          method: 'GET',
          dataType: 'json',
          responseType: 'text',
          success:(result)=>{
                console.log(result.data);
                this.setData({motto: result.data});
          },
          fail(err){
                console.log(`req 错误：${err}`);
          },
          complete(){
                console.log('请求 complete');
          }
        }
        wx.request(options);
    },
    onShow(){
        // 显示首页时清空 serchBar 值 
        app.globalData.searchBarValue = null;
    },
    onHide(){
        // 离开首页时清空该页 serchBar 值 
        this.setData({searchBarValue: null});
    },
    switchContainerToBlur(){
        // 激活 serchBar 时 blur 主页面
        this.setData({containerBlur: 'blur(10rpx)'});
    },
    switchContainerToNormal(){
        // 取消激活 serchBar 时取消 blur 主页面
        this.setData({containerBlur: null});
    },
    switchTabToBrowser(){
        wx.switchTab({
            url: `../browser/browser`
        });
    },
    syncValueToGlobalData(e){
        // 监听输入事件同步 serchBar 值至全局变量
        app.globalData.searchBarValue = e.detail.value;
    }
})
