var LOADING_TIPS = '加载中...';
var LOAD_MORE_TIPS = '点击加载更多';
var NO_MORE_TIPS = '没有更多了';
var REG_TIMER_COUNTR = 60;
var sexText = {
	'0' : '保密',
	'1' : '男',
	'2' : '女'
}
function imageBrowser(photosArr, orderNum) {
	var obj = api.require('imageBrowser');
	obj.openImages({
		imageUrls : photosArr,
		showList : false,
		activeIndex : orderNum
	});
}

//apiready = function() {if(typeof onPageInit=="function"){onPageInit();}if(typeof initPage=="function"){initPage()}
//		$api.fixIos7Bar(document.querySelector("header"));
//
//};

Zepto(function($) {
	//		if(api.systemType == 'android'&&api.systemVersion<4.4){
	//			$('.hiwall-header').css('padding-top','0');
	//			alert(1);
	//		}
	$("body").on('tap', '.func-node', function() {
		console.log('函数触发');
		var func = this.getAttribute('ref-func');
		eval(func + "(this)");
		event.preventDefault();
	});
	$("body").on('tap', '.link-node', function() {
		event.preventDefault();
		var webviewId = this.getAttribute('ref-href');
		var extraInfo = this.getAttribute('ref-info');
		var extraData = this.getAttribute('ref-data');
		var reload = this.getAttribute('reload');
		console.log('跳转触发');
		api.openWin({
			name : webviewId,
			url : webviewId,
			reload : reload,
			rect : {
				x : 0,
				y : 0,
				w : 400,
				h : 300
			},
			pageParam : {
				'extraInfo' : extraInfo,
				'extraData' : extraData
			},
			bounces : false,
			bgColor : 'rgba(0,0,0,0)',
			vScrollBarEnabled : true,
			hScrollBarEnabled : true
		});
	});
	// 此处是 jQuery 事件...

});
function redirectView(webviewId, pageParam, reload) {
	console.log('bundle data' + JSON.stringify(pageParam));
	if (reload == undefined) {
		reload = false;
	}
	api.openWin({
		vScrollBarEnabled : false,
		hScrollBarEnabled : false,
		name : webviewId,
		url : webviewId,
		reload : reload,
		rect : {
			x : 0,
			y : 0,
			w : 400,
			h : 300
		},
		pageParam : pageParam,
		bounces : true,
		bgColor : 'rgba(0,0,0,0)',
		vScrollBarEnabled : true,
		hScrollBarEnabled : true
	});
}

function startAdvAutoPlay() {
	var slider = mui("#slider");
	slider.slider({
		interval : 5000
	});
}

function openSubFrame(url, footer_h, bounces) {
	if (bounces == undefined) {
		bounces = true;
	}
	var header = $api.dom('header');
	var header_h = $api.offset(header).h;
	var body = $api.dom('body');
	var body_h = $api.offset(body).h;

	if (!isEmpty(footer_h)) {
		var rect_h = body_h - header_h - footer_h;
	} else {
		var rect_h = body_h - header_h;
	}
	api.openFrame({
		name : url,
		url : url,
		reload : true,
		rect : {
			x : 0,
			y : header_h,
			w : 'auto',
			h : rect_h
		},
		bgColor : '#EEEEEE',
		pageParam : api.pageParam,
		bounces : bounces, //是否弹动
		vScrollBarEnabled : true, //（可选项）是否显示垂直滚动条
		hScrollBarEnabled : false, //（可选项）是否显示水平滚动条
		scaleEnabled : false,//（可选项）页面是否可以缩放，为true时softInputMode参数无效
	});
}

function caculateDaysWithTimeInString(createTimeInString) {

	var result;

	var timestamp = (new Date()).valueOf();
	var currentTime = parseInt(timestamp / 1000);
	var createTime = parseInt(createTimeInString);

	var timeDifference = currentTime - createTime;

	// 一分钟之内
	if (timeDifference <= 60) {

		result = "刚刚";
		// 一小时之内
	} else if (timeDifference < 3600) {

		result = parseInt(timeDifference / 60) + "分钟前";
		// 一天之内
	} else if (timeDifference < 86400) {

		result = parseInt(timeDifference / 3600) + "小时之前";
		// 一个月之内(按31天计算)
	} else if (timeDifference < 2678400) {

		result = parseInt(timeDifference / 86400) + "天之前";
		// 超过31天
	} else {

		result = getLocalDate(new Date(createTimeInString * 1000));
	}

	return result;

};
function backToHome() {
	mui.fire(plus.webview.getLaunchWebview(), 'init_page', {
		'extraInfo' : '/HomePageContent.html'
	});
	mui.fire(plus.webview.getWebviewById('/OrderList.html'), 'init_page');
	//	plus.webview.getLaunchWebview().show('slide-in-left',300);
}

function goBack() {
	api.closeWin();
}

function checkLogin() {
	var account = localStorage.getItem("account");
	var password = localStorage.getItem("password");
	if (password != "" && account != "" && password != null && account != null) {
		return true;
	} else {
		return false;
	}
}

function getLocalDate(timeInString) {
	var time = new Date(parseInt(timeInString * 1000));
	var year = time.getFullYear();
	var month = time.getMonth() + 1;
	var date = time.getDate();
	return year + "-" + month + "-" + date + " ";
};
function getLocalTime(timeInString) {
	var time = new Date(parseInt(timeInString));
	var year = time.getFullYear();
	var month = time.getMonth() + 1;
	var date = time.getDate();
	var hour = time.getHours();
	var minute = time.getMinutes();
	var second = time.getSeconds();
	return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
};
function isEmptyObject(obj) {
	var re = /^[0-9]+.?[0-9]*$/;
	if (re.test(obj)) {
		return false;
	}
	for (var n in obj) {
		return false
	}
	return true;

}

function initPage() {
	if (api.systemType == 'android' && api.systemVersion < 4.4) {
		$('.hiwall-header').css('padding-top', '0');
	}
}

/**
 Trims white spaces around the string

 @method trim
 @static
 @param {String} str
 @return {String}
 */
var trim = function(str) {
	if (!str) {
		return str;
	}
	return String.prototype.trim ? String.prototype.trim.call(str) : str.toString().replace(/^\s*/, '').replace(/\s*$/, '');
};
function isArray(obj) {
	return Object.prototype.toString.call(obj) === '[object Array]';
}

var isEmpty = function(str) {
	if (/^\s*$/.test(str) || isEmptyObject(str) || str == "null" || str == "false" || str == undefined || (isArray(str) && str.length == 0)) {
		return true;
	} else {
		return false;
	}
}
var getJsonAjax = function(url, data, callback, errorCB) {
	for (key in data) {
		url = url + "/" + key + "/" + data[key];
	}
	//	alert(url)
	jsonAjax(url, 'get', "", '', callback, errorCB)
}
var postJsonAjax = function(url, data, callback, errorCB) {
	jsonAjax(url, 'post', data, '', callback, errorCB)
}
var postJsonFileAjax = function(url, file, callback, errorCB) {
	jsonAjax(url, 'post', '', file, callback, errorCB)
}
var postJsonImgAjax = function(url, file, callback, errorCB) {
	api.ajax({
		url : url,
		method : "post",
		timeout : 10,
		dataType : 'JSON',
		data : {
			files : file
		}
	}, function(ret, err) {
		console.log('请求返回' + JSON.stringify(ret));
		callback(ret);
		api.hideProgress();
	});
}
var jsonAjax = function(url, method, data, file, callback, errorCB) {
	api.ajax({
		url : url,
		method : method,
		timeout : 10,
		dataType : 'JSON',
		data : {
			values : data,
			files : file
		}
	}, function(ret, err) {
		console.log('请求返回' + JSON.stringify(ret));
		api.hideProgress();
		if (ret) {
			if ((isEmpty(ret.content) || ret.state == false) && errorCB != undefined) {
				errorCB(ret);
			} else if (ret.state == false) {
				if ( typeof ret.content == "object") {
					for (key in ret.content) {
						api.toast({
							msg : ret.content[key]
						});
					}
				} else if (!isEmpty(ret.content)) {
					api.toast({
						msg : ret.content
					});
				} else {
					api.toast({
						msg : '返回异常'
					});
				}
			} else {
				if (callback != undefined) {
					callback(ret.content);
				}
			}
		} else {
			api.alert({
				msg : ('错误码：' + err.code + '；错误信息：' + err.msg + '网络状态码：' + err.statusCode)
			});
		}
	});
}
var showProgress = function(title, text) {
	//	if(isEmpty(title)){
	//		title = '加载中...';
	//	}
	api.showProgress({
		style : 'default',
		animationType : 'fade',
		title : title,
		text : text,
		modal : false
	});
}
var onListviewClick = function(obj, ret, onclickCB) {
	var eventType = ret.eventType;
	var index = ret.index;
	obj.getDataByIndex({
		index : ret.index
	}, function(ret) {
		console.log('列表点击回调：' + JSON.stringify(ret));
		onclickCB(ret, eventType, index);
	});

}
function getUserInfo(callback) {
	postJsonAjax(USER_INFO_API, {
		'uid' : localStorage.getItem('uid')
	}, function(user) {
		localStorage.setItem('sex', user.sex);
		localStorage.setItem('email', user.email);
		localStorage.setItem('signature', user.signature);
		localStorage.setItem('nickname', user.nickname);
		if (callback !== undefined) {
			callback();
		}
	});
}

function saveFriendsIcon(uid, iconUrl) {
	$api.setStorage('icon-' + uid, iconUrl);
}

function getFriendsIcon(uid) {
	var icon = $api.getStorage('icon-' + uid);
	if (!isEmpty(icon)) {
		return icon;
	} else {
		return 'widget://image/user-icon.png';
	}
}

function loadFriendsInfo(uid, callback) {
	postJsonAjax(USER_INFO_API, {
		'uid' : uid
	}, function(user) {
		$api.setStorage(user.uid, user);
		if (callback != undefined) {
			callback(user);
		}
	});
}

function getFriendsInfo(uid, extraInfo) {
	var friendsInfo = $api.getStorage(uid);
	var conversation = {};
	if (uid == localStorage.getItem('uid')) {
		conversation['imgPath'] = localStorage.getItem('usericon');
		conversation['nickname'] = localStorage.getItem('nickname');
	} else if (!isEmpty(friendsInfo)) {
		console.log('保存的用户信息' + JSON.stringify(friendsInfo));
		conversation['imgPath'] = HOST + '/' + friendsInfo.avatar128;
		conversation['nickname'] = friendsInfo.nickname;
	} else if (!isEmpty(extraInfo)) {
		var friendsInfo = JSON.parse(extraInfo);
		if (friendsInfo.nickname != localStorage.getItem('nickname')) {
			conversation['imgPath'] = friendsInfo.imgPath;
			conversation['nickname'] = friendsInfo.nickname;
		} else {
			conversation['imgPath'] = 'widget://image/user-icon.png';
			conversation['nickname'] = '匿名用户';
		}
	} else {
		conversation['imgPath'] = 'widget://image/user-icon.png';
		conversation['nickname'] = '匿名用户';
	}
	return conversation;
}
function getTopicInfo(topicId) {
	var topic = $api.getStorage(topicId);
	return topic;
}
function loadTopicInfo(topicId, callback) {
	getJsonAjax(TOPIC_INFO_API, {
		'id' : topicId
	}, function(topic) {
		$api.setStorage(topic.id, topic);
		if (callback != undefined) {
			callback(user);
		}
	});
}
function checkFriendsState(uid, success, error) {
	postJsonAjax(CHECK_FRIENDS_API, {
		'uid' : localStorage.getItem('uid'),
		'target_uid' : uid
	}, success, error);
}

function addFriends(targetUid, success, error) {
	postJsonAjax(ADD_FRIENDS_API, {
		'uid' : localStorage.getItem('uid'),
		'target_uid' : targetUid
	}, success, error);
}

function replace_em(str) {
	str = str.replace(/\</g, '&lt;');
	str = str.replace(/\>/g, '&gt;');
	str = str.replace(/\n/g, '<br/>');
	str = str.replace(/\[em_([0-9]*)\]/g, '<img src="face/$1.gif" border="0" />');
	return str;
}

function verifyFriends(targetUid, success, error) {
	postJsonAjax(FRIENDS_ADD_VERIFY, {
		'uid' : localStorage.getItem('uid'),
		'target_uid' : targetUid
	}, success, error);
}

function onPageInit() {
//	api.addEventListener({
//		name : 'noticeclicked'
//	}, function(ret, err) {
//		console.log(JSON.stringify(ret));
//		if (ret.type == 0) {
//			var message = ret.value.split("&");
//			if (message[1] == 'PRIVATE') {
//				redirectView('ChatRoom.html', {
//					'friendsId' : message[0],
//				});
//			} else if (message[1] == 'GROUP') {
//
//			} else {
//
//			}
//		} else if (ret.type == 1) {
//			//开发者自定义消息
//		}
//	});
}
