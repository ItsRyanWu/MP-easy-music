let app =  getApp();
//Component Object
Component({
    options: {
        addGlobalClass: true
    },
    data: {
        isSearchBoxFocus: false,
        searchBarValue: null,
        currentPage: null,
        playlistData: null,
        isPlaylistShow: false
    },
    lifetimes: {
        attached(){
            this.setCurrentPage();
            this.updatePlaylist();
            app.event.on('updatePlaylist', this.updatePlaylist, this)
        }
    },
    pageLifetimes:{
        show(){
            this.setData({searchBarValue: app.globalData.searchBarValue})
        }
    },
    methods: {
        setCurrentPage(){
            let currentPages =  getCurrentPages(); 
            let currentPage = currentPages[currentPages.length-1]; 
            this.setData({currentPage});
        },
        updatePlaylist(){
            let playlistData = wx.getStorageSync('playlist-data') || [];
            this.setData({playlistData});
        },
        focusSearchBox(){
            this.setData({isSearchBoxFocus: true})
            app.event.emit('focusSearchBar', this.data.currentPage)
        },
        unfocusSearchBox(){
            this.setData({isSearchBoxFocus: false})
            app.event.emit('unfocusSearchBar', this.data.currentPage)
            // 如果搜索栏为空则清空所有搜索数据，初始化为未搜索状态
            let globalSearchBarValue = app.globalData.searchBarValue;
            if (!globalSearchBarValue || /^\s*$/.test(globalSearchBarValue)) {
                console.log('搜索栏已空，清除所有搜索数据');
                this.setData({searchBarValue: null})
            }
        },
        syncSearchbarValueToGlobal(event){
            this.data.searchBarValue = event.detail.value;
            app.globalData.searchBarValue = this.data.searchBarValue;
        },
        getSearchKeyWordAndNavigatingToSearchResult(){
            let searchKeyWord = app.getSearchKeyWord();
            if (!searchKeyWord || /^\s*$/.test(searchKeyWord)) return;
            wx.navigateTo({
                url: `../search-result/search-result?search=${searchKeyWord}`
            });
        },
        handleConfirmSearch(){ 
            if (this.data.currentPage.route !== 'pages/search-result/search-result'){
                this.getSearchKeyWordAndNavigatingToSearchResult();
                return;
            }
            this.data.currentPage.startSearchInSRPage();
        },
        switchPlaylistShowOff(){
            let isPlaylistShow = !this.data.isPlaylistShow;
            this.setData({isPlaylistShow});
            if(isPlaylistShow){
                this.focusSearchBox()
            } else {
                this.unfocusSearchBox()
            }
        },
        turnPlaylistOff(){
            this.setData({isPlaylistShow: false});
            this.unfocusSearchBox();
        },
        handleSongClick(event){
            let dataset = event.currentTarget.dataset;
            if(event.target.id === "listCard--single--like"){
                app.addThisSongToPlaylist(dataset);
                app.event.emit('updatePlaylist')
                return;
            }
            app.playThisSong(dataset);
        }
    }
});
  