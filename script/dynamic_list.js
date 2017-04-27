var page=1,isLock=false,lastId=0,uploadNum=0,isSynchro=false,fs,shakeLock=false,laudLock=false;

//发布动态
function dynamicAdd(){
    api.openWin({
        name: 'dynamic_add_win',
        url: 'dynamic_add_win.html',
        delay: 300
    });
}
//动态审核
function dynamicVerify(){
    api.openWin({
        name: 'dynamic_verify_win',
        url: 'dynamic_verify_win.html',
        delay: 300
    });
}
function ajaxRequest(url, method, datas, callBack) {
    var now = Date.now();
    api.ajax({
        url: url,
        method: method,
        cache: false,
        timeout: 60,
        dataType: 'json',
        data: {
            values: datas
        }
    }, function (ret, err) {
        callBack(ret, err);
    });
}
//今日收益
function todayGetCoin(){
    var userid = $api.getStorage('userid');
    var encrypt = $api.getStorage('encrypt');
    var url = '&c=member_app&a=getWalletInfo&userid='+userid+'&encrypt='+encrypt;
    ajaxRequest(url,'GET','',function(ret,err){
        if(ret){
            $api.text($api.byId('coinToday'),ret.coinToday);
            $api.text($api.byId('coinTotal'),ret.coinTotal);
        }
    })
}
//打开我的钱包
function myWallet(){
    api.openWin({
        name: 'my_wallet_win',
        url: 'my_wallet_win.html',
        delay: 300
    });
}
function reward(dynamicId){
    api.openFrame({
        name: 'dynamic_reward_frm',
        url: 'dynamic_reward_frm.html',
        bgColor: 'rgba(0,0,0,0)',
        rect: {
            x: 0,
            y: 0,
            w: 'auto',
            h: 'auto'
        },
        pageParam: {dynamicId: dynamicId},
        bounces: false,
        vScrollBarEnabled: false,
        hScrollBarEnabled: false
    });
}
function show(id){
    api.openWin({
        name: 'dynamic_show_win',
        url: 'dynamic_show_win.html',
        pageParam: {dynamicId: id},
        reload:true,
        delay: 300
    });
}
function getData(){
    isLock = true;
    var getDynamicUrl = DYNAMIC_LIST_API+'/'+page;
    console.log('请求链接：'+getDynamicUrl);
    ajaxRequest(getDynamicUrl, 'GET', '', function (ret, err) {
    	if(isEmpty(ret)||isEmpty(ret.content)){
    		return;
    	}
        if (!isEmpty(ret.content.data)) {
        	ret = ret.content.data;
            //获得最后一条数据id
            if(ret[0].id>lastId){
                lastId = ret[0].id;
            }
            var content = $api.byId('dynamic-content');
            var tpl = $api.byId('dynamic-template').text;
            var tempFn = doT.template(tpl);
            if(page>1){
                $api.append(content,tempFn(ret));
                //$api.remove($api.byId('loadPage'));
                isLock = false;
            }else{
                $api.html(content,tempFn(ret));
                //$api.remove($api.byId('loadPage'));
                isLock = false;
            }
//          hideLoading();
            echo.init({
                offset: 100,
                throttle: 250,
                callback: function (element, op) {
                }
            });
            api.parseTapmode();//优化点击事件
        } else {
           api.toast({
	           msg:'没有更多了',
               location: 'bottom'
           });
        }
    })
}

function getNewData(){
	page = 1;
    var getNewDynamicUrl = DYNAMIC_LIST_API+'/'+page;
    console.log('请求链接：'+getNewDynamicUrl);
    ajaxRequest(getNewDynamicUrl, 'GET', '', function (ret, err) {
        if (ret) {
        	console.log(JSON.stringify(ret));
        	ret = ret.content.data;
            //获得最后一条数据id
            if(ret[0].id>lastId){
                lastId = ret[0].id;
            }
            var content = $api.byId('dynamic-content');
            content.innerHTML = '';
            var tpl = $api.byId('dynamic-template').text;
            var tempFn = doT.template(tpl);
            $api.prepend(content,tempFn(ret));
            echo.init({
                offset: 0,
                throttle: 250
            });
            
        } else {
            api.toast({
                msg: '无最新故事分享 T.T',
                duration:2000,
                location: 'bottom'
            });
            
        }
    })
}


//摇一摇刷新
function shake(){
    if(shakeLock==false){
        api.addEventListener({
            name:'shake'
        },function(ret,err){
            shakeLock = true;
            page = 1;
            getData();
            setTimeout(function(){
                shakeLock = false;
            },3000)
        })
    }
    
}
function laud(dynamicId,laudTotal) {
	if (laudLock == false) {
		api.parseTapmode();
		var data = {};
		data['weibo_id'] = dynamicId;
		data['uid'] = localStorage.getItem('uid');
		laudLock = true;
		postJsonAjax(DYNAMIC_ZAN_API, data, function(ret) {
			laudTotal += 1;
			var laudTotalBox = $api.byId("laudTotal_"+dynamicId);
			$api.html(laudTotalBox, ' ' + laudTotal);
			$api.addCls(laudTotalBox, 'laud');
			//laudTotal = true;
			$api.removeAttr(laudTotalBox, 'onclick');
			api.toast({
				msg : ret
			});
		})
	}

}
apiready = function() {if(typeof onPageInit=="function"){onPageInit();}if(typeof initPage=="function"){initPage()}
//  showLoading();
    /*var myDate = new Date();
    if(myDate.getDay()==0 || myDate.getDay()==6){
        $api.css($api.byId('weekday'),'display:block');
    }*/
	api.setRefreshHeaderInfo({
        visible: true,
        loadingImg: 'widget://image/ptr_pull.png',
        bgColor: '#efeff4',
        textColor: '#959595',
        textDown: '下拉刷新',
        textUp: '松开刷新',
        showTime: false
    }, function (ret, err) {
//      todayGetCoin();
        getNewData();
        api.refreshHeaderLoadDone();
    });
//  todayGetCoin();
    getData();
    api.parseTapmode();//优化点击事件

    //摇一摇刷新
//  shake();
    //后台运行取消监听摇一摇
    api.addEventListener({
        name:'pause'
    },function(ret,err){
        api.removeEventListener({
            name: 'shake'
        });
    });
    //应用进入后台的监听，用来刷新一下数据，并重新监听摇一摇
    api.addEventListener({
        name:'resume'
    },function(ret,err){
        shake();
        todayGetCoin();
    });
    //监听是否达到底部上拉加载
    api.addEventListener({
        name : 'scrolltobottom',
        extra:{
            threshold:360
        }
    }, function(ret, err) {
        page++;
        if(isLock==false){
            getData();
        }
    });
    //重新刷新数据
    api.addEventListener({
        name: 'reLoad'
    }, function(ret){
        if(ret && ret.value){
            todayGetCoin();
            page = 1;
            getData();
        }
    });
    //重新登录
    api.addEventListener({
        name: 'reLogin'
    }, function(ret){
        if(ret && ret.value){
            todayGetCoin();
            page = 1;
            getData();
        }
    });
    //监听回复数量更新
    api.addEventListener({
        name: 'updateReplyCount'
    }, function(ret){
        if(ret && ret.value){
            var value = ret.value;
            var replyTotalBox = $api.byId("replyTotal_"+value.dynamicId);
            $api.html(replyTotalBox,' '+value.newReplyTotal);
        }
    });
    //监听点赞数量更新
    api.addEventListener({
        name: 'updateLaudCount'
    }, function(ret){
        if(ret && ret.value){
            var value = ret.value;
            var laudTotalBox = $api.byId("laudTotal_"+value.dynamicId);
            $api.html(laudTotalBox,' '+value.newLaudTotal);
        }
    });
};
