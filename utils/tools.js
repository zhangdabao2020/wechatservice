
//简单的API-将获取所有标签,获取音乐信息标签
var  jsmediatags  =  require ('jsmediatags');
//var musicUrl = './htdocs/陶喆 - Melody.ogg'
var musicPath = '/htdocs/';
var fs=require('fs');//文件操作模块
var wxDB = require('./db')
var localUrl = 'https://XXXXX.com/play/';//主机静态文件地址

//返回文件操作句柄
exports.myfs = fs;

//返回音乐列表信息
exports.readMusicMsg = function(row,str,totle,res){ 
    //拼接处完整音乐路径
    var musicName = row.name;
    var  musicUrl  = musicPath+musicName;//音乐本地地址
    var imgName = musicName.split(".")[0]+'.jpg';
    var imgPath = musicPath + imgName;
    var imgUrl = '';
    var p = row.id;
    var unfavor = row.unfavor;
    var title = row.title;
    if(fs.existsSync(imgPath)){
        imgUrl = localUrl+imgName;
        var pre = {};
        pre.id = p;
        pre.unfavor = unfavor;
        pre.title = title;
        if(row.songer){
            pre.artist = row.songer;
           }
        else{
            pre.artist  =  '未知';
        }
        pre.coverImg = imgUrl;
        pre.name = musicName;
       //console.log(pre);
       str.push(pre);
         //计数，数目达到之后返回
       if(str.length == totle){
            //console.log(str)
            //把数组序列化成json格式
            var strJosn = JSON.stringify(str);
            res.json(strJosn);
       }
    }else{
        //imgUrl = localUrl+'cover.jpg';
        jsmediatags.read(musicUrl, {
            onSuccess: function(tag) {
               // console.log(tag);
               var pre = {};
               pre.id = p;
               pre.unfavor = unfavor;
               //tag中读取到的有可能是乱码
              // pre.title = tag.tags.title;
                //直接用音乐名称  matat.mp3  输出matat
               // pre.title = musicName.split(".")[0];
               pre.title = title;
               if(row.songer){
                    pre.artist = row.songer;
               }else{
                    pre.artist  =  tag.tags.artist;
                    var sql = " UPDATE music SET songer = ? where id = ? "
                    wxDB.sqlOptionparam(sql,[tag.tags.artist,p]);
               }
               //如果携带的图片封面
               if(tag.tags.picture){
                   // pre.coverImg = 'data:'+tag.tags.picture.format + ';base64,'+ base64binary(tag.tags.picture.data);
                   if(dataToImg(tag.tags.picture.data,imgPath)){
                        pre.coverImg = localUrl+imgName;
                   }else{
                        pre.coverImg = localUrl+'cover.jpg';
                   }
               }
               else{
                        //使用默认封面
                        pre.coverImg = localUrl+'cover.jpg';
               }
               pre.name = musicName;
               //console.log(pre);
               str.push(pre);
        
               //计数，数目达到之后返回
               if(str.length == totle){
                    //console.log(str)
                    //把数组序列化成json格式
                    var strJosn = JSON.stringify(str);
                    
                    res.json(strJosn);
               }
            // console.log(tag.tags.picture.data)
              
            },
            onError: function(error) {
                    var pre = {};
                    pre.id = p;
                    pre.unfavor = unfavor;
                    //tag中读取到的有可能是乱码
                    // pre.title = tag.tags.title;
                    //直接用音乐名称  matat.mp3  输出matat
                    pre.title = title;
                    pre.coverImg = localUrl+'cover.jpg';
                    pre.name = musicName;
                    if(row.songer){
                        pre.artist = row.songer;
                   }else{
                        pre.artist  = '未知';
                   }
                    
                    str.push(pre);
                 //计数，数目达到之后返回
                    if(str.length == totle){
                    //console.log(str)
                        //把数组序列化成json格式
                        var strJosn = JSON.stringify(str);
                        res.json(strJosn);
                    }
           }
            }
            );
        
    }

   

   

}


//测试读取音乐信息
exports.testmusiccont = function(name,res){
    var path = musicPath+name;
    jsmediatags.read(path, {
        onSuccess: function(tag) {
           // console.log(tag);
           var pre = {};
           
           pre.artist  =  tag.tags.artist;
           //如果携带的图片封面
           if(tag.tags.picture){
    
                pre.coverImg = 'data:'+tag.tags.picture.format + ';base64,'+ base64binary(tag.tags.picture.data);
           }
           else{
                //使用默认封面
                pre.coverImg = '/images/cover.jpg';
           }
           res.json(pre);
        // console.log(tag.tags.picture.data)
          
        },
        onError: function(error) {
            console.log(':(', error.type, error.info);
            res.json({
                info:error.info,
                type:error.type,
                name:name
            })
       
        }
        });
}


/*使用base64处理二进制
    data: 二进制数据流
*/
function base64binary(data){
    var imgbuffer = new Buffer(data, 'binary');
    return imgbuffer.toString('base64');
}


exports.getJsonData = function(rows){
    var dataStr = JSON.stringify(rows);
    return JSON.parse(dataStr);
}
//二进制流存储进图片 data 二进制流,
function dataToImg(data,path){
    if(fs.existsSync(path)){
        return true;
    }
    try{
            var imgbuffer = new Buffer(data, 'binary');
            fs.writeFileSync(path,imgbuffer);
            return true;
        }
        catch(e){
            return false;
        }
    
}