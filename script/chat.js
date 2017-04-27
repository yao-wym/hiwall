var targetId,historyMessages,toAvatar;
var sourcePath = "widget://image/emotion";//表情存放目录
var emotionData;//存储表情
function transText(text, imgWidth, imgHeight){
    var imgWidth = imgWidth || 24;
    var imgHeight = imgHeight || 24;
    var regx= /\[(.*?)\]/gm;
    var textTransed = text.replace(regx,function(match){
        var imgSrc = emotionData[match];
        if( !imgSrc){ /* 说明不对应任何表情,直接返回即可.*/
            return match;
        }
        var img = "<img src='" + imgSrc+ "' width='" + imgWidth +  "' height ='" + imgHeight +"' />";
        return img;
    });
    return textTransed;   
}
/*获取所有表情图片的名称和真实URL地址，以JSON对象形式返回。其中以表情文本为 属性名，以图片真实路径为属性值*/
function getImgsPaths(sourcePathOfChatBox, callback){
    var jsonPath = sourcePathOfChatBox + "/emotion.json";//表情的JSON数组
    api.readFile({
        path: jsonPath
    },function(ret,err){
        if(ret.status){
            var emotionArray = JSON.parse(ret.data);
            var emotion = {};
            for(var i in emotionArray){
                var emotionItem = emotionArray[i];
                var emotionText = emotionItem["text"];
                var emotionUrl = "../image/emotion/"+emotionItem["name"]+".png";
                emotion[emotionText] = emotionUrl;
            }
            /*把emotion对象 回调出去*/
            if("function" === typeof(callback)){
                callback(emotion);
            }
        }
    });
}
//排序函数
function getSortFun(order, sortBy) {
    var ordAlpah = (order == 'asc') ? '>' : '<';
    var sortFun = new Function('a', 'b', 'return a.' + sortBy + ordAlpah + 'b.' + sortBy + '?1:-1');
    return sortFun;
}
//function getHistoryMessages(){
//  //alert(JSON.stringify(historyMessages));
//  var content = $api.byId('message-content');
//  var tpl = $api.byId('message-template').text;
//  var tempFn = doT.template(tpl);
//  if(historyMessages){
//      var newHistoryMessages = historyMessages.sort(getSortFun('asc', 'sentTime'));
//      $api.prepend(content,tempFn(newHistoryMessages));
//  }
//  
//}

function chat(){
    var obj = api.require('UIChatBox');
    obj.open({
        placeholder: '',
        maxRows: 4,
        emotionPath: sourcePath,
        styles: {
            inputBar: {
                borderColor: '#d9d9d9',
                bgColor: '#f2f2f2'
            },
            inputBox: {
                borderColor: '#B3B3B3',
                bgColor: '#FFFFFF'
            },
            emotionBtn: {
                normalImg: 'widget://image/chatBox/face1.png'
            },
            keyboardBtn: {
                normalImg: 'widget://image/chatBox/key1.png'
            }
        }
    },function(ret,err){
        if(ret.eventType=='send'){
            if(ret.msg){
                var data = {};
                data['avatar'] = avatar;
                data['text'] = transText(ret.msg);
                //alert(transText(msg));
                var content = $api.byId('message-content');
                var tpl = $api.byId('messageSend-template').text;
                var tempFn = doT.template(tpl);
                $api.append(content,tempFn(data));

                var chatDom = $api.byId('message-content');
                var frameHeight = api.frameHeight;
                $api.css(chatDom,'height:'+frameHeight+'px;');
                chatDom.scrollTop = chatDom.scrollHeight;

                echo.init({
                    offset: 0,
                    throttle: 250
                });
                //向会话列表页发送消息事件
                api.sendEvent({
                    name:'sendMessage',
                    extra:{
                        type:'text',
                        targetId:''+targetId+'',
                        content:''+ret.msg+'',
                        conversationType:'PRIVATE',
                        extra:''
                    }
                })
                obj.closeKeyboard();
            }
            
        }
    });
    obj.setInputFieldListener(function(ret,err){
        var chatDom = $api.byId('message-content');
        if(ret.chatViewH==0){
            var frameHeight = api.frameHeight;
        }else{
            var frameHeight = api.frameHeight-ret.chatViewH;
        }
        
        $api.css(chatDom,'height:'+frameHeight+'px;');
        chatDom.scrollTop = chatDom.scrollHeight;

    });
    
}

//apiready = function() {if(typeof onPageInit=="function"){onPageInit();}if(typeof initPage=="function"){initPage()}
//  
//  targetId = api.pageParam.targetId;
//  historyMessages = api.pageParam.historyMessages;
//  //获取用户信息
//  var url = '&c=message_app&a=getMemberInfo&userid='+userid+'&encrypt='+encrypt+'&toUserid='+targetId;
//  ajaxRequest(url, 'GET', '', function (ret, err) {
//      if(ret){
//          toAvatar = ret.avatar;
//          getHistoryMessages();
//          var chatDom = $api.byId('message-content');
//          var frameHeight = api.frameHeight;
//          $api.css(chatDom,'height:'+frameHeight+'px;');
//          chatDom.scrollTop = chatDom.scrollHeight;
//          //讲昵称回传至窗口
//          api.execScript({
//              name:'chat_win',
//              script:'getToNickname("'+ret.nickname+'")'
//          })
//      }
//  })
//  getImgsPaths(sourcePath, function (emotion) {
//      emotionData = emotion;
//  });
//  chat();
//
//  //监听收到新消息写入
//  api.addEventListener({
//      name:'getNewMessagePrivate'
//  },function(ret){
//      if(ret && ret.value){
//          var newMessageData = ret.value.data;
//          if(newMessageData.targetId==targetId){
//
//              var data = {};
//              data['text'] = transText(newMessageData.content.text);
//              //如果是当前用g户写入
//              var content = $api.byId('message-content');
//              var tpl = $api.byId('messageReceive-template').text;
//              var tempFn = doT.template(tpl);
//              $api.append(content,tempFn(data));
//              echo.init({
//                  offset: 0,
//                  throttle: 250
//              });
//              var chatDom = $api.byId('message-content');
//              chatDom.scrollTop = chatDom.scrollHeight;
//          }else{
//              //非当前用户提醒
//              api.notification({
//                  sound:'default',
//                  notify:{
//                      title:'新消息',
//                      content:newMessageData.data.content.text,
//                      updateCurrent: true
//                  }
//              }, function(ret, err){
//                  
//              });
//          }
//      }
//  })
// 
//};