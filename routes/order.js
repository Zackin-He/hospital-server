import express from 'express'
import Doctor from '../models/Doctor';
import RegForm from '../models/RegForm';
import db from './../db/db'
const router = express.Router({});
router.post('/web/api/addOrder',(req,res,next)=>{
    let pName = req.body.pName;//患者姓名
    let pID = req.body.pID;//患者身份证
    let pTel = req.body.pTel;//患者手机号
    let pDocID = req.body.pDocID;//医生id
    let treatDate = req.body.treatDate;//就诊日期
    let treatTime = req.body.treatTime;//就诊时间
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
                        //主治医生姓名
                        pDocName:doc.dName,
                        //主治医生id
                        pDocID:doc.dID,
                        //科室id
                        dID:doc.dPmtit,
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
router.post('/web/api/findOrder',(req,res)=>{
    let pName = req.body.pName;//患者姓名
    let pID = req.body.pID;//患者身份证号
    RegForm.find({pName:pName,pID:pID},(err,result)=>{
        if (err) return next(Error(err));
            res.json({
                status: 200,
                data: result
            })
    })
})
export default router;