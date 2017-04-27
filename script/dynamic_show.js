var dynamicId, photosArr, chatBox, replyTotal, laudTotal, emotionData, laudLock = false, page = 1;
function getRewardData() {
	postJsonAjax(DYNAMIC_COMMENT_API, {
		"weibo_id" : api.pageParam.dynamicId,
		'page' : page
	}, function(ret) {
		console.log(JSON.stringify(ret));
		var content = $api.byId('dynamic-reward');
		var tpl = $api.byId('reward-template').text;
		var tempFn = doT.template(tpl);
		$api.prepend(content, tempFn(ret));
		api.parseTapmode();
		echo.init({
			offset : 100,
			throttle : 250,
			callback : function(element, op) {
			}
		});
	})
}

//举报
function report() {
	api.prompt({
		title : '举报',
		msg : '请输入举报理由',
		buttons : ['确定', '取消']
	}, function(ret, err) {
		if (ret.buttonIndex == 1) {
			var data = {};
			data['userid'] = userid;
			data['dynamicid'] = dynamicId;
			data['remarks'] = ret.text;
			api.toast({
						msg : '举报成功',
						duration : 2000,
					});
		}
	});
}

function reward() {
	api.openFrame({
		name : 'dynamic_reward_frm',
		url : 'dynamic_reward_frm.html',
		bgColor : 'rgba(0,0,0,0)',
		rect : {
			x : 0,
			y : 0,
			w : 'auto',
			h : 'auto'
		},
		pageParam : {
			dynamicId : dynamicId
		},
		bounces : false,
		vScrollBarEnabled : false,
		hScrollBarEnabled : false
	});
}

var sourcePath = "widget://image/emotion";
//表情存放目录
var emotionData;
//存储表情
function transText(text, imgWidth, imgHeight) {
	var imgWidth = imgWidth || 24;
	var imgHeight = imgHeight || 24;
	var regx = /\[(.*?)\]/gm;
	var textTransed = text.replace(regx, function(match) {
		var imgSrc = emotionData[match];
		if (!imgSrc) {/* 说明不对应任何表情,直接返回即可.*/
			return match;
		}
		var img = "<img src='" + imgSrc + "' width='" + imgWidth + "' height ='" + imgHeight + "' />";
		return img;
	});
	return textTransed;
}

/*获取所有表情图片的名称和真实URL地址，以JSON对象形式返回。其中以表情文本为 属性名，以图片真实路径为属性值*/
function getImgsPaths(sourcePathOfChatBox, callback) {
	var jsonPath = sourcePathOfChatBox + "/emotion.json";
	//表情的JSON数组
	api.readFile({
		path : jsonPath
	}, function(ret, err) {
		if (ret.status) {
			var emotionArray = JSON.parse(ret.data);
			var emotion = {};
			for (var i in emotionArray) {
				var emotionItem = emotionArray[i];
				var emotionText = emotionItem["text"];
				var emotionUrl = "../image/emotion/" + emotionItem["name"] + ".png";
				emotion[emotionText] = emotionUrl;
			}
			/*把emotion对象 回调出去*/
			if ("function" === typeof (callback)) {
				callback(emotion);
			}
		}
	});
}

function spaceShow(toUserid) {
	redirectView('FriendsCenter.html',{'uid':toUserid},true);
}

function reply(userInfo) {
	//chatBox
	chatBox.close();
	//var frameHeight = api.frameHeight;
	/*api.setFrameAttr({
	 name: 'dynamic_show_frm',
	 rect:{
	 h:frameHeight-50
	 }
	 });*/
	chatBox.open({
		placeholder : '回复:' + userInfo.user.nickname,
		maxRows : 4,
		emotionPath : sourcePath,
		styles : {
			inputBar : {
				borderColor : '#d9d9d9',
				bgColor : '#f2f2f2'
			},
			inputBox : {
				borderColor : '#B3B3B3',
				bgColor : '#FFFFFF'
			},
			emotionBtn : {
				normalImg : 'widget://image/face1.png'
			},
			keyboardBtn : {
				normalImg : 'widget://image/key1.png'
			}
		}
	}, function(ret) {
		//点击发送按钮
		if (ret.eventType == 'send') {
			if (ret.msg) {
				//alert(JSON.stringify(ret.msg));
				//回复内容
				var newData = [];
				newData['user'] = [];
				var newDataArr = [];
				newDataArr[0] = newData;
				newData['user']['avatar64'] = userInfo.user.avatar64;
				newData['user']['nickname'] = userInfo.user.nickname;
				newData['content'] = transText(ret.msg);
				//				newData['usernickname'] = localStorage.getItem('nicakname');
				newData['create_time'] = (new Date()).getTime() / 1000;
				console.log(JSON.stringify(newData));
				//同步至服务器
				var data = {};
				data['weibo_id'] = dynamicId;
				data['uid'] = localStorage.getItem('uid');
				data['content'] = ret.msg;
				console.log('评论：' + JSON.stringify(newData));
				if (data['content']) {
					postJsonAjax(DYNAMIC_COMMENT_API, data, function(ret) {
						insertReply(newDataArr);
						chatBox.closeKeyboard();
					});
				}
			}
		}
	});
}

function insertReply(newDataArr) {
	var frameHeight = api.frameHeight;
	var content = $api.byId('dynamic-reply');
	var tpl = $api.byId('dynamicReply-template').text;
	var tempFn = doT.template(tpl);

	var noReply = $api.byId('noReply');
	if (noReply) {
		$api.remove(noReply);
	}
	$api.prepend(content, tempFn(newDataArr));
	echo.init({
		offset : 100,
		throttle : 250,
		callback : function(element, op) {
		}
	});
	//回复数增加
	replyTotal += 1;
	var replyTotalBox = $api.byId("replyTotal");
	$api.html(replyTotalBox, ' ' + replyTotal);

	//隐藏chatBox并还原frame高度
	/*setTimeout(function(){
	chatBox.close();
	api.setFrameAttr({
	name: 'dynamic_show_frm',
	rect:{
	h:frameHeight
	}
	});
	},260);*/
	//向列表页发送事件更新数量
	api.sendEvent({
		name : 'updateReplyCount',
		extra : {
			dynamicId : dynamicId,
			newReplyTotal : replyTotal
		}
	});
}

function laud(laudTotal) {
	if (laudLock == false) {
		api.parseTapmode();
		var data = {};
		data['weibo_id'] = dynamicId;
		data['uid'] = localStorage.getItem('uid');
		laudLock = true;
		postJsonAjax(DYNAMIC_ZAN_API, data, function(ret) {
			laudTotal += 1;
			var laudTotalBox = $api.byId("laudTotal");
			$api.html(laudTotalBox, ' ' + laudTotal);
			$api.addCls(laudTotalBox, 'laud');
			//laudTotal = true;
			$api.removeAttr(laudTotalBox, 'onclick');
			api.toast({
				msg : ret
			});
			api.sendEvent({
				name : 'updateLaudCount',
				extra : {
					dynamicId : dynamicId,
					newLaudTotal : laudTotal
				}
			});
		})
	}

}

function getOtherData() {
	//获得回复，点赞统计
	var getCountUrl = '&c=dynamic_app&a=dynamicOtherCount&dynamicid=' + dynamicId;
	ajaxRequest(getCountUrl, 'GET', '', function(ret, err) {
		if (ret) {
			//alert(JSON.stringify(ret));
			var replyTotalBox = $api.byId("replyTotal");
			var laudTotalBox = $api.byId("laudTotal");
			$api.html(replyTotalBox, ' ' + ret.replyTotal);
			$api.html(laudTotalBox, ' ' + ret.laudTotal);
		}
	})
	hideProgress();
}

function getReplyData() {
	var getDynamicUrl = '&c=dynamic_app&a=dynamicReply&id=' + dynamicId;
	ajaxRequest(getDynamicUrl, 'GET', '', function(ret, err) {
		if (ret) {
			var jsonData = ret.replyData.replyInfo;
			replyTotal = ret.replyData.replyTotal;
			//替换内容表情
			for (var i in jsonData) {
				jsonData[i]['content'] = transText(jsonData[i].content);
			}
			var content = $api.byId('dynamic-reply');
			var tpl = $api.byId('dynamicReply-template').text;
			var tempFn = doT.template(tpl);
			if (ret.replyData.replyTotal > 0) {
				$api.html(content, '');
				$api.prepend(content, tempFn(jsonData));
				echo.init({
					offset : 100,
					throttle : 250,
					callback : function(element, op) {
					}
				});
			}
			api.parseTapmode();
		} else {
			if (err.code != 3) {
				api.toast({
					msg : err.msg,
					duration : 2000,
					location : 'top'
				});
			}
		}
	})
}

function getData() {
	postJsonAjax(DYNAMIC_DETAIL_API, {
		'weibo_id' : dynamicId,
		'page' : page
	}, function(ret) {
		var jsonData = ret.weibo;
		if (!isEmpty(jsonData.img)) {
			for (var i = 0; i < jsonData.img.length; i++) {
				jsonData.img[i] = HOST + '/' + jsonData.img[i];
			}
			photosArr = jsonData.img;
		}
		var content = $api.byId('dynamic-content');
		var tpl = $api.byId('dynamicShow-template').text;
		var tempFn = doT.template(tpl);
		$api.html(content, tempFn(jsonData));
		echo.init({
			offset : 100,
			throttle : 250,
			callback : function(element, op) {
			}
		});
		api.hideProgress();
		api.parseTapmode();
		//优化点击事件
		replyTotal = ret.comment.length;
		//替换内容表情
		for (var i in ret.comment) {
			ret.comment[i]['content'] = transText(ret.comment[i].content);
		}
		var content = $api.byId('dynamic-reply');
		var tpl = $api.byId('dynamicReply-template').text;
		var tempFn = doT.template(tpl);
		if (!isEmpty(ret.comment)) {
			$api.html(content, '');
			$api.prepend(content, tempFn(ret.comment));
			echo.init({
				offset : 100,
				throttle : 250,
				callback : function(element, op) {
				}
			});
		}
		reply(jsonData);

	})
}

//读取本地待上传动态
function readWaitFile() {
	var cacheDir = api.cacheDir;
	api.readFile({
		path : cacheDir + '/dynamic/' + dynamicId + '.json'
	}, function(ret, err) {
		if (ret.status) {
			var jsonData = JSON.parse(ret.data);
			if (jsonData.photosUrl) {
				photosArr = jsonData.photosUrl;
			}
			laudTotal = jsonData.laudTotal;
			var content = $api.byId('dynamic-content');
			var tpl = $api.byId('dynamicShow-template').text;
			var tempFn = doT.template(tpl);
			$api.html(content, tempFn(jsonData));
			echo.init({
				offset : 0,
				throttle : 250
			});
			//hideLoading();
		}
	});
}

function imageBrowser(orderNum) {
	var obj = api.require('imageBrowser');
	var showArr = new Array();
	for(var i=0;i<photosArr.length;i++){
		showArr[i] = photosArr[i].replace(/_100_auto/,'');
	}
	obj.openImages({
		imageUrls : showArr,
		showList : false,
		activeIndex : orderNum
	});
}

apiready = function() {if(typeof onPageInit=="function"){onPageInit();}if(typeof initPage=="function"){initPage()}
	showProgress();
	dynamicId = api.pageParam.dynamicId;
	getImgsPaths(sourcePath, function(emotion) {
		emotionData = emotion;
	});
	//根据ID判断本地待上传或服务器
	//if(dynamicId.substring(0,7)=='waiting'){
	getData();
	//读取基本内容
	//  getReplyData();//回复信息
	//  getRewardData();
	api.addEventListener({
		name : 'rewardSuccess'
	}, function(ret) {
		if (ret && ret.value) {
			getRewardData();
		}
	});
	//chatBox = api.require('chatBox');UIChatBox
	chatBox = api.require('UIChatBox');
	api.addEventListener({
		name : 'swiperight'
	}, function(ret, err) {
		api.closeWin({
			name : 'dynamic_show_win'
		});
	});
	api.parseTapmode();
	//优化点击事件
};
