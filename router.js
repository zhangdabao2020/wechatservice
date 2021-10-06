

var tools = require('./utils/tools')
var wxDB = require('./utils/db')
const request = require('request')

/* //读取音乐数据文件
var musicFileJson = './db.josn';
var musicList = JSON.parse(fs.readFileSync(musicFileJson)); */

//读取音乐文件测试
exports.testmusic = function(req,res){
    var name = req.query.name;
    tools.testmusiccont(name,res);
}

//获取歌曲列表
exports.playlist = function(req,res){
/*     var str = [];
    var totle =  musicList.total;
    
    //歌曲数目总数，用于控制回调函数的退出
     var  mucdata = musicList.data;
    for(var p in mucdata){
         tools.readMusicMsg(mucdata[p].name,str,p,totle,res);
    } */
    var token = req.query.token;
    getMusicList(token,opMusicList,res);
}

//获取首页列表
exports.viewMusicList = function(req,res){
    var type = req.query.type;
    var token = req.query.token;
    getviewMusicList(type,token,opMusicList,res);

}

//个人播放历史
exports.hislist = function(req,res){
    var token = req.query.token;
    var music_id = req.query.music_id;
    wxDB.ophislist(token,music_id,res);
}

//获取搜索结果
exports.searchMusicList = function(req,res){
    var key = req.query.key;
    var token = req.query.token;
     //插入搜索记录
     var sql2 = " INSERT into  searchhis ( openid,content)  select myuser.openid ,? as content from myuser where myuser.token  = ?  ";
     wxDB.sqlOptionparam(sql2,[key,token]);
    getsearchList(key,token,opMusicList,res);

}

//收藏
exports.opFavor = function(req,res){
    var music_id  = req.query.music_id;
    var token = req.query.token;
    var unfavor = req.query.unfavor;
    doFavor(token,music_id,unfavor,res);

}
//获取歌词内容
exports.getLrc = function(req,res){
    var title = req.query.title;
    title = title.split(".")[0];
    var  lrcPath = '/htdocs/'+title + '.lrc';
    tools.myfs.readFile(lrcPath,'utf8',function(err,data){
        if(err){
            res.send('无歌词')
        }else{
            console.log(data.toString())
            res.send(data.toString());
        }

    })


}

//返回MP3文件
exports.getmp3 = function(id,res){
    var sql = " select name from music where id = ? "
    wxDB.queryparam(sql,id,getmusic,res);
}

exports.upTotalPlay = function(req,res){
    var music_id = req.query.music_id;
    var sql = " UPDATE music set totalPlay = totalPlay+1 where id =  " + music_id ;
    wxDB.sqlOption(sql);
    res.send("更新播放量");
}
//用户登录
exports.userlogin = function(req,res){
    console.log('login code: ' + req.body.code)
    var wx = wxDB.getWX();
    var url = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + wx.appid + '&secret=' + wx.secret + '&js_code=' + req.body.code + '&grant_type=authorization_code'
    
    request(url, (err, response, body) => {
        
        var session = JSON.parse(body)
        var token = 'token_' + new Date().getTime()
        if(session.openid) {
            
            //db.session[token] = session
            //保存用户sesson，openid
            wxDB.setSession(token,session);
            var sql = "INSERT into myuser (openid,session_key,token) VALUES ('"+session.openid+"', '"+session.session_key+"','"+token+"')" ;
            wxDB.sqlOption(sql);
            var sql1 = " UPDATE myuser set token = '"+token+"' where openid = '"+session.openid+"'  ";
            wxDB.sqlOption(sql1);

        }
        //返回前台，后台token
        res.json({ token: token})
    })
}


//检查用户是否已经登录
exports.checkUserLogin = function(req,res){
    
    console.log(req.query.token);
    var token = req.query.token;
    var sql  =  " select * from myuser where token = '"+token+"' ";
    wxDB.query(sql,opUserLogin,res);
}

//检查用户是否拥有权限
exports.checkuserRight = function(req,res){
    var token = req.query.token;
    var sql = " select openid,ischeck as  userright,token FROM myuser where token=? "
    wxDB.queryparam(sql,token,opright,res);

}
//获取播放列表
function getMusicList(token,callbakc,res){
    var sql = "select  music.id,music.name,music.title,music.songer from playlist "
   +" INNER JOIN myuser on myuser.openid = playlist.openid " +
   " INNER JOIN music on music.id = playlist.music_id " +
    " where myuser.token =  '" + token +"'";
    //console.log(sql);
    wxDB.query(sql,callbakc,res);

}

//返回MP3
function getmusic(rows,res){
    var name = 'Dua Lipa - Swan Song.mp3'
    if(rows.length > 0){
        name = rows[0].name;
    }
    res.type('mp3');
    res.sendFile('/htdocs/'+name);
}

//获取首页列表
function getviewMusicList(type,token,callback,res){
    var sql = "";
    if(type == 1){
        sql = " SELECT music.id,music.name,music.title,'0' as unfavor,music.songer from favor_music  "+
                " INNER JOIN myuser on myuser.openid = favor_music.openid " +
                " INNER JOIN music on music.id = favor_music.music_id "+
               "  where myuser.token = '"+token+"' ";
               
    }
    else if(type == 2){
        sql =" select music.id,music.name,music.title ,IsNULL(a.music_id) as unfavor,music.songer FROM music "+
        " left join (select favor_music.music_id from favor_music ,myuser where favor_music.openid = myuser.openid and myuser.token = '"+token+"' )  "+
        " as a on a.music_id = music.id "+
        "  ORDER BY RAND() LIMIT 90 ";
    }else{
        sql =" select music.id,music.name,music.title ,IsNULL(a.music_id) as unfavor,music.songer FROM music "+
        " left join (select favor_music.music_id from favor_music ,myuser where favor_music.openid = myuser.openid and myuser.token = '"+token+"' )  "+
        " as a on a.music_id = music.id "+
        " ORDER BY totalplay DESC LIMIT 0, 90 ";
    }
    
    wxDB.query(sql,callback,res);
}

//获取搜搜结果列表
function getsearchList(key,token,callback,res){
    var sql = "";
    sql =" select music.id,music.name,music.title ,IsNULL(a.music_id) as unfavor,music.songer FROM music "+
        " left join (select favor_music.music_id from favor_music ,myuser where favor_music.openid = myuser.openid and myuser.token = '"+token+"' )  "+
        " as a on a.music_id = music.id "+
        " where music.title like '%"+key+"%' or music.songer like '%"+key+"%'  "+
        " ORDER BY totalplay DESC LIMIT 0, 48 ";
    wxDB.query(sql,callback,res);
   

}
//处理获取列表查询结果
function opMusicList(rows,res){
    var str = [];
    //var dataJson = tools.getJsonData(rows);
    var totle =  rows.length;
    if(totle == 0){
        res.json({totle:0});
    }
    console.log(totle);
    for(var p in rows){
        tools.readMusicMsg(rows[p],str,totle,res);
   }

}

//处理用户是否登录查询列表

function opUserLogin(rows,res){

    var isLoginIn = false;
    for( var p in rows){
        isLoginIn = true;
        break;
    }
    var datasend = { is_login : isLoginIn};
   // console.log(JSON.stringify(datasend))
   
    res.json(datasend);

}

//处理收藏
function doFavor(token,music_id,unfavor,res){
    var sql =" ";
    console.log("unfavor:"+unfavor);
    if(unfavor == 1){
        var sql1 = "  select openid from myuser  where token = '"+token+"' ";
        sql = " insert into favor_music VALUES ('"+music_id+"',?)  ";
        wxDB.opfavorMusic(sql1,sql,favormusic,res);
    }
    else{
        sql = " delete from favor_music " +
        " where favor_music.music_id = '"+music_id+"' and "  +
       "  favor_music.openid in ( select openid from myuser where token = '"+token+"') ";
       wxDB.sqlOption(sql);
       res.json({result : "true"});
        
    }


}

function favormusic(rows,res){
    console.log('here'+res);
    res.json({result : "true"});
}

//处理用户权限
function opright(rows,res){
    var userright = false;
    for(var p in rows){
        if(rows[p].userright == 1){
            userright = true;

        }
    }
    console.log('userright:'+userright)

    //暂时去掉权限
    //res.json({userright : userright});
    res.json({userright : true});
}
