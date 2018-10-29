//index.js
//获取应用实例
const app = getApp()
Page({
    data: {
        albumImageSrc: 'http://p2.music.126.net/ACPwGpJZxmGKnM3rWilemA==/109951163083048605.jpg',
        song: '用不失联的爱',
        singer: '周兴哲',
        album: '如果雨之后',
        faPlay: app.globalData.faPlay
    },
    testCloudMusic(){
        let options = {
          url: 'https://zeyun.org:3443/search?keywords=永不失联的爱',
          // data: '',
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
    switchTabToBrowser(){
        wx.switchTab({
            url: `../browser/browser`,
            success: (result)=>{
                console.log(`切换 tab 成功 ${result}`)
            },
            fail: (err)=>{
                console.log(`切换 tab 失败 ${err}`)
            },
            complete: ()=>{}
        });
    },
    onShow() {
        console.log(this.data.faPlay)
    }
  //事件处理函数
//   bindViewTap: function() {
//     wx.navigateTo({
//       url: '../logs/logs'
//     })
//   },
//   onLoad: function () {
//     if (app.globalData.userInfo) {
//       this.setData({
//         userInfo: app.globalData.userInfo,
//         hasUserInfo: true
//       })
//     } else if (this.data.canIUse){
//       // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
//       // 所以此处加入 callback 以防止这种情况
//       app.userInfoReadyCallback = res => {
//         this.setData({
//           userInfo: res.userInfo,
//           hasUserInfo: true
//         })
//       }
//     } else {
//       // 在没有 open-type=getUserInfo 版本的兼容处理
//       wx.getUserInfo({
//         success: res => {
//           app.globalData.userInfo = res.userInfo
//           this.setData({
//             userInfo: res.userInfo,
//             hasUserInfo: true
//           })
//         }
//       })
//     }
//   },
//   getUserInfo: function(e) {
//     console.log(e)
//     app.globalData.userInfo = e.detail.userInfo
//     this.setData({
//       userInfo: e.detail.userInfo,
//       hasUserInfo: true
//     })
//   }
})
