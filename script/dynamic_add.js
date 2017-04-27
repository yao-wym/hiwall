function customAddress(){
    var vip = $api.getStorage('vip');
    if(vip==1){
        api.openWin({
            name: 'dynamic_add_map',
            url: 'dynamic_add_map.html',
            delay: 300,
            vScrollBarEnabled: false,
            hScrollBarEnabled: false
        });
        
    }else{
        api.toast({
            msg: '升级成为会员马上自定义位置',
            duration:2000,
            location: 'top'
        });
    }
    
}
function uploadImage(imgPath){
        var upData = {
				'file' : imgPath, 
            }
            console.log('上传图片地址：'+imgPath);
            postJsonImgAjax(DYNAMIC_IMG_API,  upData, function (ret) {
            		if(ret.status==1){
                    	$api.text($api.byId(''+imgPath+''),'上传完成');
                   	 	$api.attr($api.byId(''+imgPath+''),'data-id',''+ret.data.file.id+'');
            		}else{
            			api.toast({
	                        msg:ret.info
                        });
            		}
            }) 
}
function deleteImage(imgPath){
    $api.remove($api.dom('.image-list[data-src="'+imgPath+'"]'));
}
function selectImage(){
    api.actionSheet({
        title: '请选择图片来源',
        cancelTitle: '取消',
        buttons: ['相册选取','拍照']
    },function(ret,err){
        var winWidth = api.winWidth;
        var listHeight = winWidth/3-12;
        if(ret.buttonIndex==1){
            //ALBUM
            var album = api.require('UIMediaScanner');
            album.open({
                column: 4,
                sort: {
                    key: 'time',
                    order: 'desc'
                },
                texts: {
                    stateText: '图库',
                    cancelText: '取消',
                    finishText: '完成'
                },
                styles: {
                    bg: '#fff',
                    mark: {
                        icon: '',
                        position: 'bottom_left',
                        size: 18
                    },
                    nav: {
                        bg: '#3598DC',
                        stateColor: '#ffffff',
                        stateSize: 16,
                        cancleBg: 'rgba(0,0,0,0)',
                        cancelColor: '#ffffff',
                        cancelSize: 16,
                        finishBg: 'rgba(0,0,0,0)',
                        finishColor: '#ffffff',
                        finishSize: 16
                    }
                }
            }, function(ret){
                console.log(JSON.stringify(ret))
                if(ret){
                    //alert(JSON.stringify(ret));
                    var photoList = $api.byId("photoList");
                    var photos = ret.list;
                    var list = ret.list;
                    api.toast({
                        msg: '正在加载图片',
                        duration:1000,
                        location: 'top'
                    });
                    for(var i in list){
                        var item = list[i];
                        var imgDom = $api.dom('.image-list[img-src="'+item.path+'"]');
                        if(!imgDom){
                            $api.prepend(photoList,'<li class="aui-col-xs-4 aui-list-view-cell aui-img image-list" style="height:'+listHeight+'px;" data-src="'+item.path+'"><img class="aui-img-object uploadPhotos" src="'+item.thumbPath+'" /><div class="uploading" id="'+item.path+'">上传中</div><span class="imgdelete aui-iconfont aui-icon-delete" tapmode onclick="deleteImage(\''+item.path+'\')"></span></span></li>');
                            api.parseTapmode();
                            uploadImage(item.path);
                        }
                        console.log(photoList.outerHTML);
                    }
                }
            });
                    
        }else if(ret.buttonIndex==2){
            //TAKE A PHOTO
            api.getPicture({
                sourceType: 'camera',
                encodingType: 'jpg',
                mediaValue: 'pic',
                destinationType: 'url',
                allowEdit: false,
                quality: 60,
                targetWidth:640,
                saveToPhotoAlbum: true
            }, function(ret, err){ 
                var photoList = $api.byId("photoList");
                if (ret.data) {
                    $api.prepend(photoList,'<li class="aui-col-xs-4 aui-list-view-cell aui-img image-list" style="height:'+listHeight+'px;" data-src="'+ret.data+'"><img class="aui-img-object uploadPhotos" src="'+ret.data+'"><div class="uploading" id="'+ret.data+'">上传中</div><span class="imgdelete aui-iconfont aui-icon-delete" tapmode onclick="deleteImage(\''+ret.data+'\')"></span></span></li>');
                    api.parseTapmode();
                    uploadImage(ret.data);
                }
            });
        }
    });
}
function add(){
    var data = {};
    data['uid'] = localStorage.getItem('uid');
    var content = $api.byId('detail');
    var date = Date.parse(new Date());
    data['content'] = $api.val(content);
    var addressStatus = $api.dom(".address-type.active");

    //PHOTOS数组
    var photosIds = '';
    var photosList = $api.domAll(".uploading");
    for(var i=0;i<photosList.length;i++){
        photosIds += $api.attr(photosList[i],'data-id')+",";
    }
    photosIds = photosIds.substring(0,photosIds.length-1);
    if(!isEmpty(photosIds)){
    	data['type'] = 'image';
    	data['attach_ids'] = photosIds;
    }
//  data['photosid'] = photosIds;
    if(data['content'].length < 1){
        api.toast({
            msg: '亲，说点什么呗~',
            duration:2000,
            location: 'bottom'
        })
        return false;
    }else{
        api.showProgress({
            style: 'default',
            animationType: 'fade',
            title: '正在发布',
            text: '请稍候...',
            modal: false
        });
        console.log(JSON.stringify(data));
        //写入数据
        postJsonAjax(DYNAMIC_CREATE_API,data, function (ret) {
                api.hideProgress();
                api.sendEvent({
                    name:'reLoad',
                    extra: {key:'true'}
                })
                api.toast({
                    msg: '发布成功',
                    duration:1000,
                    location: 'bottom'
                });
                setTimeout(function(){
                    api.closeWin({
                        name:'dynamic_add_win.html'
                    })
                },1000)
        }) 
    }
}
function getLocation(){
    var baiduLocation = api.require('baiduLocation');
    baiduLocation.startLocation({
        accuracy: '500m',
        filter:1,
        autoStop: true
    }, function(ret, err){
        var sta = ret.status;
        var lat = ret.latitude;
        var lon = ret.longitude;
        var location = ''+lat+','+lon+'';
        //MY LOCATION
        var position = $api.byId('position');
        $api.val(position,''+location+'');
        //if(sta){
            var ak = 'irvgjBfbN31Ejwbz7O6eWUwW';
            api.ajax({
                url: 'http://api.map.baidu.com/geocoder/v2/?ak='+ak+'&location='+location+'&output=json&pois=0',
                method: 'get',
                timeout: 60,
                dataType: 'json',
                data:{}
            },function(ret,err){
                //alert(JSON.stringify(ret));
                var myaddress = $api.byId("myaddress");
                var address = $api.byId("address");
                if(ret.status==0){
                    $api.text(myaddress,ret.result.formatted_address);
                    $api.val(address,ret.result.formatted_address);
                }else{
                    $api.text(myaddress,'获取失败');
                    $api.val(address,'');
                }
                
            });
        //}
        var data = {};
        data['lat'] = lat;
        data['lon'] = lon;
        data['userid'] = $api.getStorage('userid');
        var url = 'http://www.qinghuwai.com/index.php?m=app&c=member_app&a=updateLocation';
        api.ajax({
            url: url,
            method: 'post',
            cache: false,
            timeout: 60,
            dataType: 'json',
            data: {
                values: data
            }
        }, function (ret, err) {
            
        });
    })
}

apiready = function() {if(typeof onPageInit=="function"){onPageInit();}if(typeof initPage=="function"){initPage()}
    //POSITION
    setTimeout(function(){
//      getLocation();
    },400);
    /*var myDate = new Date();
    if(myDate.getDay()==0 || myDate.getDay()==6){
        $api.css($api.byId('weekday'),'display:block');
    }*/
    //性别选择--单选
    var addressList = $api.domAll(".address-type");
    for(var i in addressList){
        $api.addEvt(addressList[i], 'click', function(){
            $api.removeCls($api.dom(".address-type.active"),'active');
            $api.addCls(this,'active');
        });
    }
    //监听地图返回地址事件
    api.addEventListener({
        name: 'dynamicReturnPlace'
    }, function(ret){
        if(ret && ret.value){
            var value = ret.value;
            var place = ret.value.name;
            var lat = ret.value.lat;
            var lon = ret.value.lon;
            var myaddress = $api.byId("myaddress");
            var address = $api.byId("address");
            $api.text(myaddress,ret.value.address);
            $api.val(address,ret.value.address);
            var location = ''+lat+','+lon+'';
            var position = $api.byId('position');
            $api.val(position,''+location+'');
        }
    });
}
