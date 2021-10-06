
var mysql = require('mysql');
 var pool = mysql.createPool({
    host     : '',
    port     : 3306,
    database : '',
    user     : '',
    password : '',
}); 

/* var pool = mysql.createPool({
    host     : 'localhost',
    port     : 3306,
    database : 'wxapp',
    user     : 'root',
    password : '0412',
}); */

//小程序唯一标识
const wx = {
    appid: 'XXXX',
    secret: 'XXXXXXXXXX'
}

//模仿数据库记录用户id
var db = {
    session: {}
}

exports.getWX = function(){
    return wx;
}

exports.getSesson = function (code){
    return db.session[code]
}

exports.setSession = function(code,session){
    db.session[code] = session
}


//查询
exports.query = function(sql,callback,res){
    pool.getConnection(function(err,connection){
        if(err) console.log('数据库建立连接失败');
        else{
            connection.query(sql,function(err,rows){
                if(err) console.log('查询数据操作失败:'+sql);
                else{
                    
                    callback(rows,res);
                    connection.release();
                }

            })

        }


    })
}

//带参数查询
exports.queryparam = function(sql,param,callback,res){
    pool.getConnection(function(err,conn){
        if(err) console.log('数据库建立连接失败');
        else{
            sql = conn.format(sql,param);
            conn.query(sql,function(err,rows){
                if(err)console.log('操作失败：'+sql);
                else{
                    callback(rows,res);
                    conn.release();
                }
            })
        }

    })
}
//插入，更新，删除

exports.sqlOption = function(sql){
    pool.getConnection(function(err,conn){
        if(err) console.log(err);
        else{
            conn.query(sql,function(err,res){
                if(err) console.log('操作失败'+ sql);
                else{
                    console.log('操作成功：'+ sql);
                    conn.release();
                }
            })
        }

    })
}

//插入，更新，删除 带参数

exports.sqlOptionparam = function(sql,param){
    pool.getConnection(function(err,conn){
        if(err) console.log(err);
        else{
            sql = conn.format(sql,param);
            conn.query(sql,function(err,res){
                if(err) console.log('操作失败'+ sql);
                else{
                    console.log('操作成功：'+ sql);
                    conn.release();
                }
            })
        }

    })
}

//处理收藏问题
exports.opfavorMusic = function(sql1,sql2,callback,resssss){
    pool.getConnection(function(err,coon){
        if(err) console.log(err.message);
        else{
            coon.query(sql1,function(err,rows){
                if(err)console.log('操作失败：'+sql1);
                else{
                    for(var p in rows){
                        
                        var openid =  rows[p].openid;
                        console.log("openid:"+openid);
                        sql2 = coon.format(sql2,openid);
                        coon.query(sql2,function(err,rows){
                                if(err)console.log('操作失败：'+sql2);
                                else{
                                    
                                    callback(rows,resssss);
                                    coon.release();
                                }
                        })
                    }
                }

            })
        }


    })
}


//处理个人播放历史记录问题
exports.ophislist = function(token,music_id,res){
    pool.getConnection(function(err,con){
        if(err)console.log(err.message);
        else{
            var sql1 = " select openid FROM myuser where token = ? ";
            sql1 = con.format(sql1,token);
            con.query(sql1,function(err,rows){
                if(err)console.log("查询出错："+sql1);
                else{
                    for(var p in rows){
                        var openid = rows[p].openid;
                        var sql2 = " select total FROM playlist where music_id = ? and openid = ? "
                        sql2  = con.format(sql2,[music_id,openid]);
                        con.query(sql2,function(err,rows){
                            if(err)console.log("查询出错："+sql2);
                            else{
                                if(rows.length > 0){
                                    
                                    var sql3 = " UPDATE playlist SET total = total+1 where music_id = ? and openid = ? "
                                    sql3 =  con.format(sql3,[music_id,openid]);
                                    con.query(sql3,function(err){
                                        if(err){
                                            console.log("查询出错："+sql3)
                                        }
                                        else{
                                            con.release();
                                            res.json({result:true})
                                        }
                                    })
                                }
                                else{
                                    var sql4 = " insert into playlist VALUES (?,?,0) ";
                                    sql4 = con.format(sql4,[music_id,openid]);
                                    con.query(sql4,function(err){
                                        if(err)console.log("查询出错："+ sql4);
                                        else{
                                            con.release();
                                            res.json({result:true});
                                        }
                                    })
                                }
                            }
                        })

                    }
                }
            })
        }

    })

        
        
}