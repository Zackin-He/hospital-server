import express from 'express'
import db from '../db/db';
import Doctor from '../models/Doctor';
const router = express.Router({});
//前台接口
router.get('/web/api/addDoc',(req,res)=>{
    const doctor = new Doctor({
        // 医生姓名
        dName: '刘德华',
        //医生职称
        docTitle:'主任医师',
        // 医生编号
        dID:100004,
        //性别
        dGender:'男',
        //身份证
        dIDCard:'440903200006111718',
        //出生日期
        dBirthday:new Date(2000,5,15),
        //所属科室
        dDepartment:'大学城针灸',
        //所属科室编号
        dPmtid:'0004',
        //电话
        dTel:'13046277412',
        //排班情况
        dScheduling:[
            {date:new Date(2022,2,10).getTime(),isVisit:true,am1:6,am2:9,pm1:3,pm2:30},
            {date:new Date(2022,2,11).getTime(),isVisit:true,am1:4,am2:9,pm1:35,pm2:30},
            {date:new Date(2022,2,12).getTime(),isVisit:true,am1:4,am2:9,pm1:5,pm2:30},
            {date:new Date(2022,2,14).getTime(),isVisit:false,am1:4,am2:2,pm1:35,pm2:3},
            {date:new Date(2022,2,15).getTime(),isVisit:true,am1:4,am2:9,pm1:35,pm2:30},
            {date:new Date(2022,2,16).getTime(),isVisit:false,am1:4,am2:9,pm1:35,pm2:30},
        ]
    });
    doctor.save((err,result)=>{
        if (err) {
            return next(Error(err))
        }
        res.send({
            success_code: 200,
                data: result,
                message: '添加医师成功'
        })
    })
})
router.get('/web/api/getDocByDay',(req,res)=>{
    let s_id = req.query.s_id;
    let date = req.query.date;
    console.log(date);
    let isVisitDoc = [];
    Doctor.find({dPmtid:s_id},(err,result)=>{
        if (err) return next(Error(err));
            if (result) {
                result.forEach(doc => {
                    doc.dScheduling.forEach(item=>{
                        if(item.date==date){
                            isVisitDoc.push(doc);
                        }
                    })
                });
                console.log(isVisitDoc);
                res.json({
                    status:200,
                    doc:isVisitDoc
                })
            } else {
                res.send({
                    error_code: 0,
                    message: '没有当天出诊医师'
                })
            }
    })
})
router.get('/web/api/getDocById',(req,res)=>{
    let dID = req.query.dID;
    Doctor.find({dID},(err,result)=>{
        if (err) return next(Error(err));
        if (result) {
            res.json({
                status:200,
                doc:result
            })
        }else{
            res.send({
                error_code: 0,
                message: '没有查到该医师信息'
            })
        }
    })
})
router.post('/web/api/scheduling',(req,res,next)=>{
    let dID = req.body.dID;//医生id
    let schedule = req.body.schedule;//排班数据
    db.collection('doctors').updateOne({dID:dID},{$set:{dScheduling:schedule}},{safe:true},(err,result)=>{
        if(err){
            return next(err);
        }
        res.json({
            status:200,
            message:'排班成功'
        })
    })
})


//后台管理接口
router.get('/web/api/getDoctors',(req,res)=>{
    Doctor.find({},(err,result)=>{
        if (err) return next(Error(err));
        if (result) {
            res.json({
                status:200,
                doc:result
            })
        }
    })
})
export default router;