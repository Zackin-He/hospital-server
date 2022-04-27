import express from 'express'
import Doctor from '../models/Doctor';
import RegForm from '../models/RegForm';
import Departments from '../models/Departments';
import db from './../db/db'
const router = express.Router({});
router.post('/web/api/addOrder',(req,res,next)=>{
    let pName = req.body.pName;//患者姓名
    let pID = req.body.pID;//患者身份证
    let pTel = req.body.pTel;//患者手机号
    let pDocID = req.body.pDocID;//医生id
    let treatDate = req.body.treatDate;//就诊日期
    let treatTime = req.body.treatTime;//就诊时间
    let email = req.body.email
    let orderNum = '';
    for (let i = 0; i < 8; i++) {
        orderNum+=Math.floor(Math.random()*9+1);
    }
    Doctor.findOne({dID:pDocID},(err,doc)=>{
        if (err) return next(Error(err));
        if (doc) {
            for (let i = 0; i < doc.dScheduling.length; i++) {
                if(doc.dScheduling[i].date===treatDate&&doc.dScheduling[i][treatTime]>0){
                    //相应的剩余号数-1
                    if (treatTime=='am1') {
                        db.collection('doctors').updateOne({dID:pDocID,"dScheduling.date":treatDate},{
                            $inc: {"dScheduling.$.am1":-1}
                        })
                    }else if (treatTime=='am2') {
                        db.collection('doctors').updateOne({dID:pDocID,"dScheduling.date":treatDate},{
                            $inc: {"dScheduling.$.am2":-1}
                        })
                    }
                    else if (treatTime=='pm1') {
                        db.collection('doctors').updateOne({dID:pDocID,"dScheduling.date":treatDate},{
                            $inc: {"dScheduling.$.pm1":-1}
                        })
                    }
                    else if (treatTime=='pm2') {
                        db.collection('doctors').updateOne({dID:pDocID,"dScheduling.date":treatDate},{
                            $inc: {"dScheduling.$.pm2":-1}
                        })
                    }
                    //添加预约单
                    const order = new RegForm({
                        // 患者姓名
                        pName: pName,
                        // 患者身份证
                        pID:pID,
                        //患者邮箱
                        pEmail:email,
                        //主治医生姓名
                        pDocName:doc.dName,
                        //主治医生id
                        pDocID:doc.dID,
                        //科室id
                        dID:doc.dPmtid,
                        //科室
                        dpmt:doc.dDepartment,
                        //单号
                        regNumber:orderNum,
                        //预约时间
                        regTime:new Date,
                        //就诊日期
                        treatDate:treatDate,
                        //就诊时间
                        treatTime:treatTime,
                        //患者手机号
                        pTel:pTel
                        
                    })
                    order.save((err,result)=>{
                        if (err) {
                            return next(Error(err))
                        }
                         res.send({
                                status_code: 200,
                                data: result,
                                message: '预约成功'
                        });
                    })
                    break;
                }else if(i==doc.dScheduling.length-1){
                    res.send({
                        status_code: 0,
                        message: '预约失败,暂无剩余号数'
                    })
                }
            }
        }else{
            res.send({
                error_code: 0,
                message: '没有找到该医生'
            })
        }
    })
})
router.post('/web/api/findOrder',(req,res,next)=>{
    let email = req.body.email;//患者账号
    RegForm.find({pEmail:email},(err,result)=>{
        if (err) return next(Error(err));
            res.json({
                status: 200,
                data: result
            })
    })
})
router.get('/web/api/getOrders',(req,res,next)=>{
    if (req.session.userID) {
        RegForm.find({},(err,result)=>{
            if (err) return next(Error(err));
            res.json({
                status: 200,
                data: result
            })
        })
    }else{
        res.send({
            status:401,
            message:'请重新登录!'
        })
    }
})
router.post('/web/api/getOrdersByCondition', (req, res, next) => {
    if (req.session.userID) {
        let regNumber = req.body.regNumber;
        let pName = req.body.pName;
        let pDocName = req.body.pDocName;
        let dID = req.body.dpmt;
        console.log(regNumber,pName,pDocName,dID);
        RegForm.find({
            'regNumber': {
                $regex: regNumber
            },
            'pName': {
                $regex: pName
            },
            'pDocName': {
                $regex: pDocName
            },
            'dID': {
                $regex: dID
            }
        }, (err, result) => {
            if (err) return next(Error(err));
            res.send({
                status: 200,
                data: result
            })
        });

    } else {
        res.send({
            status: 401,
            message: '请重新登录!'
        })
    }

})
router.post('/web/api/getOrdersByConditionAndID', (req, res, next) => {
    if (req.session.userID) {
        let regNumber = req.body.regNumber;
        let pName = req.body.pName;
        let docID = req.body.docID;
        RegForm.find({
            'regNumber': {
                $regex: regNumber
            },
            'pName': {
                $regex: pName
            },
            'pDocID': docID
        }, (err, result) => {
            if (err) return next(Error(err));
            res.send({
                status: 200,
                data: result
            })
        });

    } else {
        res.send({
            status: 401,
            message: '请重新登录!'
        })
    }

})
router.post('/web/api/getOrdersByDocID',(req,res,next)=>{
    let dID = req.body.dID
    if (req.session.userID) {
        RegForm.find({pDocID:dID},(err,result)=>{
            if (err) return next(Error(err));
            res.json({
                status: 200,
                data: result
            })
        })
    }else{
        res.send({
            status:401,
            message:'请重新登录!'
        })
    }
})
router.post('/web/api/cancelOrder',(req,res,next)=>{
    let regNumber = req.body.regNumber;//预约单号
    let pDocID = req.body.pDocID;//医生id
    let treatDate = req.body.treatDate;//就诊日期
    let treatTime = req.body.treatTime;//就诊时间
    db.collection('regforms').deleteOne({regNumber:regNumber});
    Doctor.findOne({dID:pDocID},(err,doc)=>{
        if (err) return next(Error(err));
        if (doc) {
            for (let i = 0; i < doc.dScheduling.length; i++) {
                if(doc.dScheduling[i].date===treatDate){
                    //相应的剩余号数+1
                    if (treatTime=='am1') {
                        db.collection('doctors').updateOne({dID:pDocID,"dScheduling.date":treatDate},{
                            $inc: {"dScheduling.$.am1":1}
                        })
                    }else if (treatTime=='am2') {
                        db.collection('doctors').updateOne({dID:pDocID,"dScheduling.date":treatDate},{
                            $inc: {"dScheduling.$.am2":1}
                        })
                    }
                    else if (treatTime=='pm1') {
                        db.collection('doctors').updateOne({dID:pDocID,"dScheduling.date":treatDate},{
                            $inc: {"dScheduling.$.pm1":1}
                        })
                    }
                    else if (treatTime=='pm2') {
                        db.collection('doctors').updateOne({dID:pDocID,"dScheduling.date":treatDate},{
                            $inc: {"dScheduling.$.pm2":1}
                        })
                    }
                    break;
                }
            }
        }
    })
    res.send({
        status:200,
        message:'取消预约成功'
    })
})
router.post('/web/api/getOrdersByDates',async (req,res,next)=>{
    let dateType = req.body.dateType;
    let todayTime = new Date(new Date().toLocaleDateString()).getTime();
    console.log(todayTime);
    let dayTime = 1000*60*60*24;
    if (dateType===1) {
        var data = [];
        for (let i = 0; i < 7; i++) {
            let time = todayTime+dayTime*i;
            let count = await RegForm.find({treatDate:time}).count();
            console.log(count);
            data[i] = count
        }
    }
    if (dateType===2) {
        var data = [];
        for (let i = 0,j=6; i < 7; i++,j--) {
            let time = todayTime-dayTime*j;
            let count = await RegForm.find({treatDate:time}).count();
            data[i] = count
        }
    }
    res.send({
        result:data,
        status:200
    })
})
router.post('/web/api/getOrdersBySpecialty',(req,res,next)=>{
    let specialtyList = [];
    let data = [];
    Departments.find({}, (err, list) => {
        list.forEach((item)=>{
            specialtyList = specialtyList.concat(item.specialty)
        });
        let k = 0
        specialtyList.forEach(async (item,index)=>{
            let value = await RegForm.find({dID:item.specialty_id}).count();
            k++;
            if (value>0) {
                data.push({
                    value:value,
                    name:item.specialty_name
                })
            }
            if (k==specialtyList.length) {
                console.log(data);   
                res.send({
                    result:data,
                    status:200
                })
            }

        })
    });
})
export default router;