/*
 ＊融云的初始化
 */
var oldestMessageId = 0;
var errorCode = {
	'30001' : '断开链接,请重新登陆或查看网络是否打开',
	'22406' : '不在群组内',
	'30014' : '发送处理失败',
	'31009' : '已被拉入黑名单',
	'30003' : '服务器超时'
};
function rongCloudInit() {
	var rong = api.require('rongCloud2');
	//  var token = localStorage.getItem('token');
	//融云初始化
	//连接
	console.log('初始化：token=' + localStorage.getItem('token'));
	rong.connect({
		token : localStorage.getItem('token')
	}, function(ret, err) {
		console.log('连接状态' + JSON.stringify(ret));
		if (ret.status == 'success') {
			api.sendEvent({
				name : 'rongConnected',
				extra : {
					key : 'true',
				}
			});
			//          localStorage.set
			api.execScript({
				name : 'index.html',
				script : 'connectStatus=1'
			});
		}
	});
}

function getToken(callback) {
	api.ajax({
		url : RONG_TOKEN_API,
		method : 'post',
		timeout : 30,
		dataType : 'json',
		data : {
			values : {
				"func" : "getToken",
				"data[userId]" : localStorage.getItem('uid'),
				"data[name]" : localStorage.getItem('nickname'),
				"data[portraitUri]" : localStorage.getItem('usericon')
			}
		}
	}, function(ret, err) {
		console.log(JSON.stringify(ret));
		if (isEmpty(ret)) {
			return;
		}
		if (ret.code == 200) {
			//      		alert(ret.token);
			localStorage.setItem('token', ret.token);
			callback();
			//				receiveMessageListener();
			//      		createDiscussion('默认群组',localStorage.getItem('token'));
		}
	});
}

function createDiscussion(name, uid) {
	//	rong.init(function(ret, err){
	//  if (ret.status == 'error')
	//      api.toast({ msg: err.code });
	//	});
	//	rong.connect({
	//  token: localStorage.getItem('token')},
	//  function(ret, err){
	//      if (ret.status == 'success')
	//          api.toast({ msg: '用户id'+ret.result.userId });
	//
	//	});
	rong.createDiscussion({
		name : name,
		userIdList : [uid]
	}, function(ret, err) {
		if (ret.status == 'success') {
			api.alert({
				msg : '讨论组id' + ret.result.discussionId
			});
			localStorage.setItem('discussionId', ret.result.discussionId);
		} else {
			api.alert({
				msg : '错误码' + err.code
			});
		}
	})
}

function sendTextMsg(msgType, targetId, msgText, callback,extra) {
	rong = api.require('rongCloud2');
	//	var extra = JSON.stringify({
	//		'nickname' : friends.title,
	//		'imgPath' : friends.imgPath
	//	});
	rong.sendTextMessage({
		conversationType : msgType,
		targetId : targetId,
		text : msgText,
//		extra : extra
	}, function(ret, err) {
		console.log(JSON.stringify(err));
		console.log(JSON.stringify(ret));
		if (ret.status == 'prepare')
			console.log(JSON.stringify(ret.result.message));
		else if (ret.status == 'success') {
			//      	getHistoryMessages(friendsId);
			callback(localStorage.getItem('uid'), msgText);
		} else if (ret.status == 'error'){
			//			alert(JSON.stringify(err));
			if(err.code == 22406){
				rongJoinGroup(targetId,"test");
			}
			api.toast({
				msg : '链接错误：' + err.code
			});
		}
	})
}

function sendImgMsg(msgType, targetId, imagePath, callback) {
	rong = api.require('rongCloud2');
	rong.sendImageMessage({
		conversationType : msgType,
		targetId : targetId, // 发送者 userId
		imagePath : imagePath,
		extra : ''
	}, function(ret, err) {
		if (ret.status == 'prepare')
			console.log(JSON.stringify(ret.result.message));
		else if (ret.status == 'success') {
			//			callback();
		} else if (ret.status == 'progress') {
			if (ret.status == 'success') {
				console.log('图片上传进度' + JSON.stringify(ret.result.progress));
			}
		} else if (ret.status == 'error')
			api.toast({
				msg : err.code
			});
		//          callback();
	})
}

function sendPrivateTextMsg(targetId, msgText, callback) {
	sendTextMsg('PRIVATE', targetId, msgText, callback);
}

function sendGroupTextMsg(targetId, msgText, callback) {
	sendTextMsg('GROUP', targetId, msgText, callback);
}

function sendPrivateImgMsg(targetId, imgPath, callback) {
	sendImgMsg('PRIVATE', targetId, imgPath, callback);
}

function sendGroupImgMsg(targetId, imgPath, callback) {
	sendImgMsg('GROUP', targetId, imgPath, callback);
}

//function getHistoryMessages(friendsId, callback) {
//	var rong = api.require('rongCloud2');
//	//	rong.init(function(ret, err){
//	//  if (ret.status == 'error')
//	//      api.toast({ msg: err.code });
//	//	});
//	//	rong.connect({
//	//  token: localStorage.getItem('token')});
//	// 之前调用 init 和 connect 的代码省略
//	rong.getHistoryMessages({
//		conversationType : 'PRIVATE',
//		targetId : friendsId,
//		count : 20
//	}, function(ret, err) {
//		console.log(JSON.stringify(ret));
//		callback(ret.result.sort(getSortFun('desc', 'sentTime')));
//	})
//}

function getConversationList() {
	var rong = api.require('rongCloud2');
	rong.getConversationList(function(ret, err) {
		if (ret.status == 'error') {
			console.log('获取会话列表错误：' + err);
		} else {
			if (!isEmpty(ret.result)) {
				console.log('send getConversationList event');
				api.sendEvent({
					name : 'getConversationList',
					extra : {
						key : 'true',
						msgList : ret
					}
				});
			}
		}
	});
}

function getLatestMessages(msgType, targetId, callback) {
	var rong = api.require('rongCloud2');
	// 之前调用 init 和 connect 的代码省略
	rong.getLatestMessages({
		conversationType : msgType,
		targetId : targetId,
		count : 20
	}, function(ret, err) {
		console.log(JSON.stringify(ret));
		console.log(JSON.stringify(err));
		if (!isEmpty(ret.result)) {
			oldestMessageId = ret.result[ret.result.length - 1].messageId;
			callback(ret.result.sort(getSortFun('asc', 'sentTime')));
		}
	})
}

function getHistoryMessages(msgType, targetId, callback) {
	//			alert(oldestMessageId);
	var rong = api.require('rongCloud2');
	// 之前调用 init 和 connect 的代码省略
	rong.getHistoryMessages({
		conversationType : msgType,
		targetId : targetId,
		oldestMessageId : oldestMessageId,
		count : 20
	}, function(ret, err) {
		api.refreshHeaderLoadDone();
		console.log(JSON.stringify(ret));
		console.log(JSON.stringify('targetId=' + targetId));
		if (!isEmpty(ret.result)) {
			oldestMessageId = ret.result[ret.result.length - 1].messageId;
			callback(ret.result.sort(getSortFun('desc', 'sentTime')));
		}
	})
}

function getLatestGroupMsg(targetId, callback) {
	getLatestMessages('GROUP', targetId, callback);
}

function getLatestPrivateMsg(targetId, callback) {
	getLatestMessages('PRIVATE', targetId, callback);
}

function getHistoryGroupMsg(targetId, callback) {
	getHistoryMessages('GROUP', targetId, callback);
}

function getHistoryPrivateMsg(targetId, callback) {
	getHistoryMessages('PRIVATE', targetId, callback);
}

function receiveMessageListener() {
	var rong = api.require('rongCloud2');
	var uid = $api.getStorage('uid');
	console.log('监听消息:' + localStorage.getItem('token'));
	rong.setOnReceiveMessageListener(function(ret, err) {
		console.log('消息提示' + JSON.stringify(ret));
		console.log('消息错误' + JSON.stringify(err));
		//var d = JSON.parse(ret.result.message.content.data);
		console.log('新消息:' + JSON.stringify(ret.result.message));

		if (ret.result.message.conversationType == 'SYSTEM') {
		} 
		else if (ret.result.message.conversationType == 'PRIVATE') {
			var friendsInfo = $api.getStorage(ret.result.message.targetId);
			//发送一个有新消息的事件
			if (isEmpty(friendsInfo)) {
				loadFriendsInfo(ret.result.message.targetId);
				var nickname = "新消息"
			} else {
				var nickname = friendsInfo.nickname;
			}
			var notificate = {
				notify : {
					extra : ret.result.message.targetId + "&" + ret.result.message.conversationType,
					title : nickname,
					content : ret.result.message.content.text,
					updateCurrent : true
				}
			}
			api.sendEvent({
				name : 'getNewMessagePrivate',
				extra : {
					data : ret.result.message
				}
			})
		} else if (ret.result.message.conversationType == 'GROUP') {
			var groupInfo = getTopicInfo(ret.result.message.targetId);
			//发送一个有新消息的事件
			if (isEmpty(groupInfo)) {
				loadTopicInfo(ret.result.message.targetId);
				var title = "话题消息"
			} else {
				var title = groupInfo.title;
			}
			var notificate = {
				notify : {
					extra : ret.result.message.targetId + "&" + ret.result.message.conversationType,
					title : title,
					content : ret.result.message.content.text,
					updateCurrent : true
				}
			}
			api.sendEvent({
				name : 'getNewMessageGroup',
				extra : {
					data : ret.result.message
				}
			})
		} else {
			return;
		}
		notificate['sound'] = 0;
		if ($api.getStorage('voiceState') == 1 || $api.getStorage('voiceState') == undefined) {
			notificate['sound'] = 'default';
		}
		if ($api.getStorage('vibrationState') == 1 || $api.getStorage('voiceState') == undefined) {
			notificate['vibrate'] = 1000;
		}
		console.log(JSON.stringify(notificate));
		api.notification(notificate, function(ret, err) {
			console.log(JSON.stringify(ret));
			if (ret.conversationType == 'PRIVATE') {
				//				alert(JSON.stringify(ret));
			} else if (ret.conversationType == 'GROUP') {
				//				alert(ret.targetId);
			} else {
				//				alert(ret.targetId);
			}
		});
		api.sendEvent({
			name : 'getNewMessage',
			extra : {
				key : 'true'
			}
		})
	})
}

setConnectListener = function() {
	var RongIMClient = api.require('rongCloud2');
	RongIMClient.setConnectionStatusListener(function(ret, err) {
		var status = ret.result.connectionStatus;
		if (status == 'CONNECTED') {
			console.log('链接成功');
			localStorage.setItem('connected', 1);
		} else if (status == 'CONNECTING') {
			console.log('正在链接');
		} else if ('RECONNECT' == status) {
			console.log('重新链接');
		} else if ('KICKED' == status) {
			console.log('其他设备登陆');
			api.toast({
				msg : '其他设备登陆,请重新登陆'
			});
			localStorage.setItem('connected', 0);
		} else if (status == 'CLOSURE') {
			console.log('断开链接');
			localStorage.setItem('connected', 0);
		} else if ('UNKNOWN_ERROR' == status) {

		} else if (status == 'LOGOUT') {
			console.log('登出');
			localStorage.setItem('connected', 0);
		} else if ('BLOCK' == status) {
			console.log('用户已被封禁');
			localStorage.setItem('connected', 0);
		}
	});
}
function getUserIcon() {

}

function setUserIconCache() {

}

function quitGroup(groupId, callback) {
	rongQuitGroup(groupId, function() {
		postJsonAjax(QUIT_GROUP_API, {
			'uid' : localStorage.getItem('uid'),
			'group_id' : groupId
		}, callback)
	})
}

function rongQuitGroup(groupId, callback) {
	var rong = api.require('rongCloud2');
	rong.quitGroup({
		groupId : groupId
	}, function(ret, err) {
		if (ret.status == 'success') {
			console.log("融云退出群组成功:" + JSON.stringify(ret));
			callback();
		} else
			console.log("进入群组失败:" + JSON.stringify(err));
	});
}

function rongJoinGroup(groupId, groupName) {
	var rong = api.require('rongCloud2');
	rong.joinGroup({
		groupId : groupId.toString(),
		groupName : groupName
	}, function(ret, err) {
		if (ret.status == 'success')
			console.log("进入群组成功:" + JSON.stringify(ret));
		else{
			console.log("进入群组失败:" + JSON.stringify(err));
			api.toast({
	            msg:JSON.stringify(err)
            });
		}
	});
}

function rongSyncGroup(groupList) {
	var rong = api.require('rongCloud2');
	rong.syncGroup({
		groups : groupList
		//      groups: [
		//          {
		//              groupId: '123',
		//              groupName: 'Ski Club',
		//              portraitUri: 'http://club.com/ski.jpg'
		//          }, {
		//              groupId: '456',
		//              groupName: 'Diving Club',
		//              portraitUri: 'http://club.com/diving.jpg'
		//          }
		//      ]
	}, function(ret, err) {
		if (ret.status == 'success') {
			console.log('同步群组' + JSON.stringify(ret.status));
		} else
			api.toast({
				msg : err.code
			});
	})
}

//排序函数
function getSortFun(order, sortBy) {
	var ordAlpah = (order == 'asc') ? '>' : '<';
	var sortFun = new Function('a', 'b', 'return a.' + sortBy + ordAlpah + 'b.' + sortBy + '?1:-1');
	return sortFun;
}

function removePrivateConversation(targetId, success) {
	var rong = api.require('rongCloud2');
	rong.removeConversation({
		conversationType : 'PRIVATE',
		targetId : targetId
	}, function(ret, err) {
		if (ret.status = 'success') {
			if (success != undefined) {
				callback();
			}
		} else {
			api.toast({
				msg : ret.status
			});
		}
	})
}

function clearMsgUnreadStatus(targetId) {
	var rong = api.require('rongCloud2');
	// 之前调用 init 和 connect 的代码省略
	rong.clearMessagesUnreadStatus({
		conversationType : 'PRIVATE',
		targetId : targetId
	}, function(ret, err) {
		getUnreadPrivteCount();
		api.sendEvent({
			name : 'clearUnreadStatus',
			extra : {
				targetId : targetId,
			}
		});
	})
}

function getUnreadPrivteCount() {
	var rong = api.require('rongCloud2');
	rong.getUnreadCountByConversationTypes({
		conversationTypes : ['PRIVATE']
	}, function(ret, err) {
		//		api.toast({
		//	        msg:ret.result
		//      });
		api.sendEvent({
			name : 'getUnreadCount',
			extra : {
				unreadCount : ret.result,
			}
		});
	})
}