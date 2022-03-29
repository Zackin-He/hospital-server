import express from "express";
import db from './../db/db'
import bodyParser from './../middle_wares/body_parser'
const app = express();
// import 'nodemailer'

let nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport'),
    cronJob = require('cron').CronJob;
 
// SMTP 连接
let transport = nodemailer.createTransport(smtpTransport({
  // 主机
  host: 'smtp.sina.com',
  // 是否使用 SSL
  secure: false,
  secureConnection:true,
  // 网易的SMTP端口
  port: 25, 
  auth: {
    // 账号
    user: 'hezeting520@sina.com', 
    // 授权码(自行百度邮箱SMTP的授权码设置)，此处非密码
    pass: '3d1da5125a43f116' 
  }
}));
// 设置邮件内容
let mailOptions = {
  // 发件人地址，例如 1234<1234@163.com>
  from: 'hezeting520@sina.com', 
  // 收件人地址，可以使用逗号隔开添加多个
  // '***@qq.com, ***@163.com'
  to: '2238565104@qq.com', 
  // 标题
  subject: 'Hello World', 
  // 邮件内容可以自定义样式
  html: '<strong style="color: red">测试"邮件轰炸机"</strong>'
}
// 定时发送邮件
// 每秒执行一次
// 具体的各项设置查看上方的链接
transport.sendMail(mailOptions, (error, response) => {
    if (error) {
      console.error(error)
    } else {
      console.log('Message Send Ok')
    }
    // 记得关闭连接
    transport.close();
  })

//   new cronJob('* * * * * *', () => {
//     console.log(1);
//   }, null, true, 'Asia/Shanghai');

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

app.get('/test',(req,res)=>{
    res.json({
        message:'获取到a了',
        status:200
    })
    // res.render('<h1>hahah</h1>');
})
app.listen(3000,()=>{
    console.log('服务器已经启动了，端口号是3000呢');
})