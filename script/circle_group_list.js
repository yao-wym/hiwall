function showCircleSpace(circleId){
    api.openWin({
        name:'circle_group_space_win',
        url:'circle_group_space_win.html',
        pageParam: {circleId: circleId},
        delay:300
    })
}
function getData(){
    var url = '&c=circle_app&a=circleGroupList&userid='+userid+'&encrypt='+encrypt;
    ajaxRequest(url, 'GET', '', function (ret, err) {
        if (ret) {
            var content = $api.byId('circle-content');
            var tpl = $api.byId('circle-template').text;
            var tempFn = doT.template(tpl);
            $api.html(content,tempFn(ret));
            echo.init({
                offset: 0,
                throttle: 250
            });
            hideLoading();
        }
    })
}
function circleAdd(){
    api.openWin({
        name:'circle_add_win',
        url:'circle_add_win.html',
        delay:300
    })
}
apiready = function() {if(typeof onPageInit=="function"){onPageInit();}if(typeof initPage=="function"){initPage()}
    showLoading();
    getData();
	api.setRefreshHeaderInfo({
        visible: true,
        loadingImg: 'widget://image/ptr_pull.png',
        bgColor: '#efeff4',
        textColor: '#4d4d4d',
        textDown: '下拉刷新...',
        textUp: '松开刷新...',
        showTime: true
    }, function (ret, err) {
        api.refreshHeaderLoadDone();
        getData();
    });
    //监听刷新圈子
    api.addEventListener({
        name: 'refreshCircleGroup'
    }, function(ret, err){
        var value = ret.value;
        if(value.key=='true'){
            getData();
        }
    });
};