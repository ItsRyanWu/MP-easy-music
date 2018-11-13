let app =  getApp();
//Component Object
Component({
    data: {
        isSearchBoxFoucs: false,
        searchBarValue: null,
        currentPage: null
    },
    methods: {
        focusSearchBox(){
            this.setData({isSearchBoxFoucs: true})
            app.event.emit('focusSearchBar', this.data.currentPage)
        },
        unfocusSearchBox(){
            this.setData({isSearchBoxFoucs: false})
            app.event.emit('unfocusSearchBar', this.data.currentPage)
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
        handleConfirmSearch(){ 
            if (this.data.currentPage.route !== 'pages/search-result/search-result'){
                this.getSearchKeyWordAndNavigatingToSearchResult();
                return;
            }
            this.data.currentPage.startSearchInSRPage();
        }
    },
    created: function() {

    },
    attached: function() {

    },
    ready: function() {
        let currentPages =  getCurrentPages(); 
        let currentPage = currentPages[currentPages.length-1]; 
        this.setData({currentPage})
    },
    moved: function() {

    },
    detached: function() {

    },
});
  