import express from "express";
import db from './../db/db'
import bodyParser from './../middle_wares/body_parser'
const app = express();
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