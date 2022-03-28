import express from 'express'
import db from '../db/db';
import Doctor from '../models/Doctor';
const router = express.Router({});
//前台接口
router.post('/web/api/addDoc', (req, res, next) => {
    if (req.session.userID) {
        const doctor = new Doctor({
            // 医生姓名
            dName: req.body.dName,
            //医生职称
            docTitle: req.body.docTitle,
            // 医生编号
            dID: req.body.dID,
            //性别
            dGender: req.body.dGender,
            //所属科室
            dDepartment: req.body.dDepartment,
            //所属科室编号
            dPmtid: req.body.dPmtid,
            //电话
            dTel: req.body.tel,
            //简介
            dIntroduction: req.body.introduction,
            //排班情况
            dScheduling: []
        });
        doctor.save((err, result) => {
            if (err) {
                return next(Error(err))
            }
            res.send({
                status: 200,
                data: result,
                message: '添加医师成功'
            })
        })
    } else {
        res.json({
            status: 401,
            message: '你还没登录'
        })
    }
})
router.get('/web/api/getDocByDay', (req, res) => {
    let s_id = req.query.s_id;
    let date = req.query.date;
    console.log(date);
    let isVisitDoc = [];
    Doctor.find({
        dPmtid: s_id
    }, (err, result) => {
        if (err) return next(Error(err));
        if (result) {
            result.forEach(doc => {
                doc.dScheduling.forEach(item => {
                    if (item.date == date) {
                        isVisitDoc.push(doc);
                    }
                })
            });
            console.log(isVisitDoc);
            res.json({
                status: 200,
                doc: isVisitDoc
            })
        } else {
            res.send({
                error_code: 0,
                message: '没有当天出诊医师'
            })
        }
    })
})
router.get('/web/api/getDocById', (req, res, next) => {
    let dID = req.query.dID;
    Doctor.find({
        dID
    }, (err, result) => {
        if (err) return next(Error(err));
        if (result) {
            res.json({
                status: 200,
                doc: result
            })
        } else {
            res.send({
                error_code: 0,
                message: '没有查到该医师信息'
            })
        }
    })
})
router.post('/web/api/scheduling', (req, res, next) => {
    let dID = req.body.dID; //医生id
    let schedule = req.body.schedule; //排班数据
    db.collection('doctors').updateOne({
        dID: dID
    }, {
        $set: {
            dScheduling: schedule
        }
    }, {
        safe: true
    }, (err, result) => {
        if (err) {
            return next(err);
        }
        res.json({
            status: 200,
            message: '排班成功'
        })
    })
})


//后台管理接口
router.get('/web/api/getDoctors', (req, res) => {
    if (req.session.userID) {
        Doctor.find({}, (err, result) => {
            if (err) return next(Error(err));
            if (result) {
                res.json({
                    status: 200,
                    doc: result
                })
            }
        })
    } else {
        res.json({
            status: 401,
            message: '你还没登录'
        })
    }

})
//根据条件获取医生
router.post('/web/api/getDoctorsByCondition', (req, res, next) => {
        
    if (req.session.userID) {
        let dName = req.body.dName;
        let dSpecialty = req.body.dSpecialty;
        let dTitle = req.body.dTitle;
        console.log(dName,dSpecialty,dTitle);
        Doctor.find({'dName':{$regex:dName},'dPmtid':{$regex:dSpecialty},'docTitle':{$regex:dTitle}}, (err, result) => {
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
router.post('/web/api/changeDoctor', (req, res, next) => {
    if (req.session.userID) {
        let dID = req.body.dID;
        let name = req.body.dName;
        let gender = req.body.dGender;
        let s_id = req.body.s_id;
        let s_name = req.body.s_name;
        let introduction = req.body.introduction;
        let docTitle = req.body.docTitle;
        db.collection('doctors').updateOne({
            dID: dID
        }, {
            $set: {
                dName: name,
                dGender: gender,
                docTitle: docTitle,
                dPmtid: s_id,
                dDepartment: s_name,
                dIntroduction: introduction
            }
        }, (err) => {
            if (err) throw err;
        });
        res.send({
            status: 200,
            message: '修改成功'
        })
    } else {
        res.send({
            status: 401,
            message: '登录已经过期!'
        })
    }


})
export default router;