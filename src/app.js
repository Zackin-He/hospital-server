import express from "express";
import db from './../db/db'
import bodyParser from './../middle_wares/body_parser'
const app = express();
app.all('*',(req,res,next)=>{
    res.header("Access-Control-Allow-Origin", '*');
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    // res.header('Access-Control-Allow-Credentials','true')
    if (req.method.toLowerCase()=='options') {
        res.sendStatus(200);
    }else{
        next()
    }
    // next()
})
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