import express from "express";
import db from './../db/db'
import multer from 'multer'
import bodyParser from './../middle_wares/body_parser'
const app = express();
app.use(express.static("./public"))
// import 'nodemailer'
let upload = multer({})
require('./nodemail')

app.all('*',(req,res,next)=>{
    if( req.headers.origin == 'http://localhost:8080' || req.headers.origin == 'http://localhost:8081' ){
        res.header("Access-Control-Allow-Origin", req.headers.origin);
        res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        res.header('Access-Control-Allow-Credentials','true')
    }
    // res.header("Access-Control-Allow-Origin", '*');
    // res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
    // res.header("Access-Control-Allow-Headers", "X-Requested-With");
    // res.header('Access-Control-Allow-Headers', 'Content-Type');
    // res.header('Access-Control-Allow-Credentials','true')
    if (req.method.toLowerCase()=='options') {
        res.sendStatus(200);
    }else{
        next()
    }
    // next()
})
// 引入express-session
import session from 'express-session'
// 引入connect-mongo用于express连接数据库存储session
const mongoStore  = require('connect-mongo')(session);
// 使用session
app.use(session({
    secret: 'hospital.com',
    name: 'hezeting',
    resave:false,
    saveUninitialized:true,
    cookie:{maxAge:1800000},
    rolling:true,
    store:new mongoStore({
        url:'mongodb://localhost:27017/hospital',
        touchAfter: 1800000
    })
}));

app.use(bodyParser);
//引入路由
import indexRouter from './../routes/index'
import doctorRouter from './../routes/doctor'
import orderRouter from './../routes/order'

app.use(indexRouter);
app.use(doctorRouter);
app.use(orderRouter)

app.post("/file",upload.single("xixi"),(req,res)=>{
    // req.file表示上传文件信息,默认是不存在的,只有被multer中间件处理过之后才有,如下我们打印
    //上面这句话的意思简而言之,就是你发起post上传图片的请求了，有图片上传了才能打印出req.file的信息来
    console.log(req.file);
    var {buffer,mimetype,encoding,originalname,fieldname,size}=req.file
    //req.file是一个对象,它里面的buffer属性就是我们要写入文件夹的图片
    // 将buffer写入到文件内部,为了防止后面的图片文件覆盖前面的图片文件,所以我们要使用时间戳让文件名无法重复
    // 判断尺寸size表示图片的大小
    console.log(size);
    if(size>=5000000){
        return res.send({err:-1,mgs:"图片尺寸过大"})
    }
    // 限制图片文件格式类型 1.前端判断  2.后端判断
    var typs=["jpg","gif","png","jpeg"]
    var extName=mimetype.split("/")[1]
    if(typs.indexOf(extName)===-1){
    return res.send({err:-2,mgs:"图片类型错误！"})
    }

    var t=Math.random()
    var ext=req.file.mimetype.split("/")[1]
   // 然后用fs模块写入图片到img文件夹下
    fs.writeFile(path.join(__dirname,"./public/img/"+t+"."+ext),buffer,(err)=>{
        if(err){
            console.log(err);
            res.send({jg:"图片上传失败！"})
        }else{
            res.send({jg:"图片上传成功！",path:`/img/${t}.${extName}`})
        }
    })
})
app.listen(3000,()=>{
    console.log('服务器已经启动了，端口号是3000呢');
})