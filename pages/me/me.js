//获取应用实例
const app = getApp()
Page({
    data: {
        favPlaylistData: null,
        isSearchBoxFoucs: false,
        isBlur: false,
    },
    onLoad(){
        this.updateFavPlaylist()
        app.event.on('update-fav-playlist', this.updateFavPlaylist, this)
    },
    updateFavPlaylist(){
        let favPlaylistData = wx.getStorageSync('fav-playlist-data') || [];
        this.setData({favPlaylistData});
    },
    handleSongClick(event){
        let dataset = event.currentTarget.dataset;
        if(event.target.id === "listCard--single--remove"){
            let removeIndex = dataset.playlistindex;
            app.removeThisSongFrom('fav-playlist', removeIndex);
            return;
        }
        app.playThisSong(dataset);
    }
})
