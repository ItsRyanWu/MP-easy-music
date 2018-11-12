//index.js
//获取应用实例
const app = getApp()
Page({
    data: {
        nowPlaying: null,
        playButtonStatus: 'to-play',
        isSearchBoxFoucs: false,
        searchBarValue: null,
        music_song_tips: '编辑推荐'
    },
    onLoad(){
        if (wx.getStorageInfoSync().keys.includes('editor-choice')){
            app.rollASongFromEditorChoice();
            app.requestForANewEditorChoiceAndSave().then((result)=>{
                console.log('最新编辑推荐歌单已更新并缓存')
            })
        } else {
            app.requestForANewEditorChoiceAndSave().then((result)=>{
                console.log('初始化下载编辑推荐歌单成功并缓存')
                app.rollASongInEditorChoiceAndSync(this);
            })
        }
        // 监听事件背景音乐上下文
        app.globalData.BackgroundAudioManager.onPlay(()=>{
            console.log('BAM 开始播放', app.globalData.BackgroundAudioManager)
            this.setData({playButtonStatus: 'to-pause'});
        })
        app.globalData.BackgroundAudioManager.onPause(()=>{
            console.log('BAM 已暂停', app.globalData.BackgroundAudioManager)
            this.setData({playButtonStatus: 'to-play'});
        })
        app.globalData.BackgroundAudioManager.onStop(()=>{
            console.log('BAM 已停止', app.globalData.BackgroundAudioManager)
            this.setData({playButtonStatus: 'to-play'});
        })
        app.globalData.BackgroundAudioManager.onEnded(()=>{
            console.log('BAM 已结束', app.globalData.BackgroundAudioManager)
            this.setData({playButtonStatus: 'to-play'});
            app.setSongInfoToBAM(this.data.nowPlaying);
        })
        app.event.on('nowPlayingChanged', this.syncGlobalNowPlaying, this)
    },
    onShow(){
        // 显示该页时同步 globalData 的 searchBar 值
        this.syncGlobalNowPlaying();
        this.setData({searchBarValue: app.globalData.searchBarValue});
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
    syncGlobalNowPlaying(){
        this.setData({nowPlaying: app.globalData.nowPlaying})
    },
    switchPlayPause(){
        let BAM = app.globalData.BackgroundAudioManager;
        if (BAM.paused == undefined ){
            // BAM 初始化设置 dataset
            app.playThisSong(this.data.nowPlaying);
        } else if (BAM.paused){
            if (BAM.src.length > 0){
                // 继续播放
                BAM.play();
                return;
            } else {
                // BAM 初始化设置 dataset
                app.playThisSong(this.data.nowPlaying);
                return;
            }
        }
        // 歌曲正在播放状态 paused === true
        BAM.pause();
    }
})
