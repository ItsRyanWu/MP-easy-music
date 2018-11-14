//index.js
//获取应用实例
const app = getApp()
Page({
    data: {
        nowPlaying: null,
        playButtonStatus: 'to-play',
        music_song_tips: '编辑推荐',
        isBlur: false
    },
    onLoad(){
        if (wx.getStorageInfoSync().keys.includes('editor-choice')){
            this.rollASongFromEditorChoice();
            app.requestForANewEditorChoiceAndSave()
            .then((result)=>{
                console.log('最新编辑推荐歌单已更新并缓存')
            })
        } else {
            app.requestForANewEditorChoiceAndSave()
            .then((result)=>{
                console.log('初始化下载编辑推荐歌单成功并缓存')
                this.rollASongFromEditorChoice();
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
    },
    rollASongFromEditorChoice(){
        let editor_choice = wx.getStorageSync('editor-choice');
        let rollASongIndex = Math.round(Math.random()*(editor_choice.length-1));
        let rollResultData = editor_choice[rollASongIndex];
        app.setSongInfoToGlobalData(rollResultData);
    },
    syncGlobalNowPlaying(){
        this.setData({nowPlaying: app.globalData.nowPlaying})
    }
})
