/**
 * 从服务器获取升级数据
 */
function checkUpdate(callback) {
	api.ajax({
		url : HOST_UPDATE_API,
		method : "get",
		timeout : 10,
		dataType : 'JSON',
	}, function(ret) {
		console.log("获取升级数据，保存文件成功！" + JSON.stringify(ret));
		try {
			checkUpdateData(ret, callback);
		} catch (e) {
			console.log("读取升级信息错误" + JSON.stringify(e));
			return;
		}
	});
}

function openBrowser(url) {
	api.openApp({
		androidPkg : 'android.intent.action.VIEW',
		mimeType : 'text/html',
		uri : url
	}, function(ret, err) {
		var msg = JSON.stringify(ret);
		console.log('打开外部浏览器返回' + msg);
	});
}

function checkUpdateData(j, callback) {
	var curVer = api.appVersion;
	console.log("当前版本" + curVer);
	inf = j[api.systemType];
	if (inf) {
		var srvVer = inf.version;
		// 判断是否存在忽略版本号
		var vabort = localStorage.getItem(srvVer);
		if (vabort && srvVer == vabort) {
			// 忽略此版本
			return;
		}
		console.log("服务器版本" + srvVer);
		// 判断是否需要升级
		if (compareVersion(curVer, srvVer)) {
			// 提示用户是否升级
			api.confirm({
				title : "软件更新",
				msg : inf.title,
				buttons : ['取消', '立即更新']
			}, function(ret, err) {
				if (ret.buttonIndex == 1) {
					return;
				} else if (ret.buttonIndex == 2) {
					openBrowser(inf.url)
				} else if (ret.buttonIndex == 1) {
					api.alert({
						msg : '点击了确定'
					});
				}
			});
		} else {
			if (callback != undefined) {
				callback();
			}
		}
	}
}

/**
 * 比较版本大小，如果新版本nv大于旧版本ov则返回true，否则返回false
 * @param {String} ov
 * @param {String} nv
 * @return {Boolean}
 */
function compareVersion(ov, nv) {
	if (!ov || !nv || ov == "" || nv == "") {
		return false;
	}
	var b = false, ova = ov.split(".", 4), nva = nv.split(".", 4);
	for (var i = 0; i < ova.length && i < nva.length; i++) {
		var so = ova[i], no = parseInt(so), sn = nva[i], nn = parseInt(sn);
		if (nn > no || sn.length > so.length) {
			return true;
		} else if (nn < no) {
			return false;
		}
	}
	if (nva.length > ova.length && 0 == nv.indexOf(ov)) {
		return true;
	}
}