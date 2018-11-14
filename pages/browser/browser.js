//获取应用实例
const app = getApp()
Page({
    data: {
        editorChoiceData: null,
        isSearchBoxFocus: false,
        isBlur: false
    },
    onLoad(){
        try {
            var editorChoiceData = wx.getStorageSync('editor-choice');
            console.log(`读取数据成功：编辑推荐歌单`)
        } catch (err) {
            console.log(`读取数据失败：编辑推荐歌单 ${err.errMsg}`)
        }
        this.setData({editorChoiceData})
    },
    handleSongClick(event){
        let dataset = event.currentTarget.dataset;
        if(event.target.id === "listCard--single--like"){
            app.addThisSongTo('fav-playlist', dataset);
            return;
        }
        app.playThisSong(dataset);
    }
})
