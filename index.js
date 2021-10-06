var express = require('express')
var serveIndex = require('serve-index')
var serveStatic = require('serve-static')
const bodyParser = require('body-parser')//处理post接收参数
var multiparty = require('multiparty')
var router = require('./router');
var LOCAL_BIND_PORT = 5050
var app = express()


 


/* app.post('/upload', function(req, res) {
  var form = new multiparty.Form()
  form.encoding = 'utf-8'
  form.uploadDir = './htdocs/upfile'
  form.maxFilesSize = 4 * 1024 * 1024
  form.parse(req, function(err, fields, files) {
    if(err) {
      console.log('parse error: ' + err)
    } else {
      console.log('parse files: ' + JSON.stringify(files))
    }
    res.writeHead(200, {'content-type': 'text/plain;charset=utf-8'})
    res.write('received upload')
    res.end()
  })
})
 */
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

//测试
app.get('/test',function(req,res){
      res.send("helloword");

})

//测试获取歌词
app.get('/testlrc',router.getLrc);
//测试读取歌曲内容
app.get('/testmusic',router.testmusic);
//请求静态音乐资源  访问挂载磁盘  根目录
var serve1 = serveStatic('/htdocs')
//为静态资源创建虚拟的play路径
app.use('/play', express.static('/htdocs'));
//指定何种路径使用中间件
app.use('/play', serveIndex('/htdocs', {'icons': true}))
app.get('/play/*', function(req, res) {   
    var type = req.query.type;
    var id = req.query.id;
    if(type == 'mp3'){
        router.getmp3(id,res);
    }
    else{
      serve1(req, res)
    }
    
});



//个人播放历史
app.get('/history',router.hislist);

//更新播放量
app.get('/settotal',router.upTotalPlay);

//用户登录
app.post('/login',router.userlogin);

//检查用户是否已经登录
app.get('/checklogin',router.checkUserLogin);

//检查用户权限
app.get('/checkright',router.checkuserRight)
//获取音乐列表
app.get('/playlist',router.playlist);

//获取首页展示列表
app.get('/viewlist',router.viewMusicList);

//处理收藏事件
app.get('/favor',router.opFavor);

//获取歌词资源
app.get('/lrc',router.getLrc);
//搜索结果
app.get('/search',router.searchMusicList);

/* //请求静态音乐资源
var serve = serveStatic('./htdocs')
//为静态资源创建虚拟的play路径
app.use('/play', express.static( __dirname+'htdocs'));
//指定何种路径使用中间件
app.use('/play', serveIndex('./htdocs', {'icons': true}))
app.get('/play/*', function(req, res) {   
    serve(req, res)
}); */


console.log(`Start static file server at ::${LOCAL_BIND_PORT}, Press ^ + C to exit`)
app.listen(LOCAL_BIND_PORT)
