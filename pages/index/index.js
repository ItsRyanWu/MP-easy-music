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
    onHide(){
        // 离开首页时清空该页 serchBar 值 
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
    switchTabToBrowser(){
        wx.switchTab({
            url: `../browser/browser`,
            success(){
                let currentPages =  getCurrentPages();
                if (currentPages[currentPages.length-1].route === 'pages/browser/browser'){
                    let browser = currentPages[currentPages.length-1];
                    browser.setData({isSearching: true})
                } else {
                    console.log('currentPages 不是 browser')
                }
            }
        });
    },
    syncValueToGlobalData(e){
        // 监听输入事件同步 serchBar 值至全局变量
        app.globalData.searchBarValue = e.detail.value;
    },
    startSearchingAndSwitchingTab(){
        let searchKeyWord = app.globalData.searchBarValue;
        if (!searchKeyWord || /^\s*$/.test(searchKeyWord)) return;
        this.switchTabToBrowser();
        app.startSearchingContent(searchKeyWord);
    }
})
