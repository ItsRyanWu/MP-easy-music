const utils = require('./utils/util.js');
const Event = utils.Event
//app.js
App({
    globalData: {
        nowPlaying: null,
        searchBarValue: null,
        BackgroundAudioManager: null,
        debug: true
    },
    event: new Event(),
    // 生命周期：启动
    onLaunch(){
        // 请求最新编辑推荐歌单并储存
        this.requestForANewEditorChoiceAndSave();
        // 初始化获取 BAM
        this.globalData.BackgroundAudioManager = wx.getBackgroundAudioManager();
        // 全局监听搜索框聚焦事件
        this.event.on('focusSearchBar', function(currentPage){currentPage.setData({isBlur: true, isSearchBoxFocus: true})})
        // 全局舰艇搜索框失焦事件
        this.event.on('unfocusSearchBar', function(currentPage){currentPage.setData({isBlur: false, isSearchBoxFocus: false})})
    },
    getSearchKeyWord(){
        let searchKeyWord = this.globalData.searchBarValue;
        return searchKeyWord;
    },
    getSongSourceUrl(dataset){
        let songId = dataset.songdata.id;
        let source = dataset.source;
        return new Promise((resolve, reject)=>{
            wx.request({
                url: `https://zeyun.org:3444/api/get/song/${source}?id=${songId}`,
                header: {'content-type':'application/json'},
                method: 'GET',
                dataType: 'json',
                responseType: 'text',
                success: (result)=>{
                    resolve(result.data.url);
                },
                fail: (err)=>{
                    reject(`获取歌曲 url 错误：${err.errMsg}`)
                },
                complete: ()=>{
                }
            });
        })
    },
    setSongInfoToGlobalData(dataset){
        // 如果已经解析过 songUrl
        if (!dataset.url) {
            // 为自己创建的全局音乐变量设置属性
            this.globalData.nowPlaying = dataset;
            this.event.emit('nowPlayingChanged');
            this.getSongSourceUrl(dataset)
            .then(url=>{
                this.globalData.nowPlaying.url = url;
                this.event.emit('nowPlayingChanged'); 
            }).catch(err=>{
                console.log(err);
            })
            return;
        } 
        // 为自己创建的全局音乐变量设置属性
        this.globalData.nowPlaying = dataset;
        // 发布变更消息
        this.event.emit('nowPlayingChanged');
    },
    setSongInfoToBAM(dataset){
        let info = {
            songName: dataset.songdata.name,
            artistsName: dataset.songdata.artists.map(item => item.name).join(' / '),
            albumName: ` - ${dataset.songdata.album.name}`, // hack 解决下拉菜单歌手名与专辑名没有空隙的问题
            songUrl: dataset.url,
            albumImage_small: dataset.songdata.album.cover
        }
        this.globalData.BackgroundAudioManager.title = info.songName;
        this.globalData.BackgroundAudioManager.singer = info.artistsName;
        this.globalData.BackgroundAudioManager.epname= info.albumName;
        this.globalData.BackgroundAudioManager.src = info.songUrl;
        this.globalData.BackgroundAudioManager.coverImgUrl = info.albumImage_small;
    },
    playThisSong(dataset){
        // 请求获取歌曲链接以及图片链接
        if (!dataset.url){
            this.getSongSourceUrl(dataset)
            .then((url)=>{
                dataset.url = url;
                // 为背景音频上下文设置属性
                this.setSongInfoToBAM(dataset);
                // 为全局音乐变量设置属性
                this.setSongInfoToGlobalData(dataset);
            })
            return;
        }
        // 为背景音频上下文设置属性
        this.setSongInfoToBAM(dataset);
        // 为全局音乐变量设置属性
        this.setSongInfoToGlobalData(dataset);
    },
    playPreNextSong(whichPlaylist, preOrNext){
        let {index: songIndexInPlaylist, playlistLength} = this.whereThisSongIn(whichPlaylist, this.globalData.nowPlaying);
        songIndexInPlaylist = Number(songIndexInPlaylist)
        let nextSongIndexInPlaylist;
        if (preOrNext === 'next'){
            // 下一首
            // 如果歌曲在列表中为最后一首则跳转到第一首
            nextSongIndexInPlaylist = songIndexInPlaylist === playlistLength-1 ? 0 : songIndexInPlaylist+1;
        } else {
            // 上一首
            // 如果歌曲在列表中为第一首则重复当前歌曲
            nextSongIndexInPlaylist = songIndexInPlaylist === 0 ? songIndexInPlaylist : songIndexInPlaylist-1;
        }
        let listData = wx.getStorageSync(`${whichPlaylist}-data`) || [];
        this.playThisSong(listData[nextSongIndexInPlaylist]);
    },
    addThisSongTo(whichPlaylist, dataset){
        let listData = wx.getStorageSync(`${whichPlaylist}-data`) || [];
        listData.unshift(dataset)
        wx.setStorageSync(`${whichPlaylist}-data`, listData);
        this.event.emit(`update-${whichPlaylist}`)
    },
    removeThisSongFrom(whichPlaylist, removeIndex){
        let listData = wx.getStorageSync(`${whichPlaylist}-data`) || [];
        listData.splice(removeIndex, 1);
        wx.setStorageSync(`${whichPlaylist}-data`, listData);
        this.event.emit(`update-${whichPlaylist}`)
    },
    whereThisSongIn(whichPlaylist, dataset){
        let targetId = dataset.songdata.id;
        let listData = wx.getStorageSync(`${whichPlaylist}-data`) || [];
        var iterationId;
        for(let index in listData){
            iterationId = listData[index].songdata.id;
            if(iterationId === targetId){
                return {index, playlistLength: listData.length}
            }
        }
        return {index: -1, playlistLength: listData.length}
    },
    requestForANewEditorChoiceAndSave(){
        return new Promise((resolve, reject)=>{
            // 请求编辑推荐歌单数据
            wx.request({
                url: 'https://zeyun.org/easy-music/editor-choice.json',
                header: {'content-type':'application/json'},
                method: 'GET',
                dataType: 'json',
                responseType: 'text',
                success: (result)=>{
                    console.log('数据请求完成：编辑推荐歌单')
                    wx.setStorage({
                        key: 'editor-choice',
                        data: result.data,
                        success: ()=>{
                            console.log('数据储存完成：编辑推荐歌单');
                            resolve('done');
                        },
                        fail: (err)=>{
                            console.error(`数据储存失败：编辑推荐歌单 ${err.errMsg}`)
                        },
                        complete: ()=>{}
                    });
                },
                fail: (err)=>{
                    console.error(`数据请求失败：编辑推荐歌单 ${err.errMsg}`)
                },
                complete: ()=>{}
            });
        })
    }
})

