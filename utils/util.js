export const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

export const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

export const startSearchingContent = (searchKeyWord, currentPage) => {
    if (/^\s*$/.test(searchKeyWord)) return;
    var reqTask = wx.request({
        url: `https://zeyun.org:3443/search?keywords=${searchKeyWord}`,
        header: {'content-type':'application/json'},
        method: 'GET',
        dataType: 'json',
        responseType: 'text',
        // 搜索数据请求成功
        success: (result)=>{
            console.log(`数据请求完成：搜索关键词 ${searchKeyWord}`);
            let searchResult = result.data.result.songs;
            // 将数据存入缓存
            // wx.setStorage({
            //     key: 'NEMusic_SearchResult',
            //     data: searchResult,
            //     success: ()=>{
            //         console.log(`数据储存完成：搜索关键词 ${searchKeyWord} `)
                    // console.log(wx.getStorageInfoSync());
                    // console.log(wx.getStorageSync('NEMusic_SearchResult')) 
                // },
                // fail: (err)=>{
                //     console.error(`数据储存失败：搜索关键词 ${searchKeyWord} ${err.errMsg}`)
                // },
                // complete: ()=>{
            // let searchResultInStorage = wx.getStorageSync('NEMusic_SearchResult'); 
            currentPage.setData({isSearching: false, NEMusic_SearchResult: searchResult})
                // }
            // });
        },
        fail: (err)=>{
            console.error(`数据请求失败：搜索关键词 ${searchKeyWord} ${err.errMsg}`)
        },
        complete: ()=>{}
    });
}
