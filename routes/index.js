import express from 'express'
import Departments from '../models/Departments';
import User from '../models/User';
import db from '../db/db';
const router = express.Router({});

router.get('/web/api/departmentList', (req, res) => {
    Departments.find({}, (err, list) => {
        console.log(list[0]);
        res.send({
            success_code: 200,
            data: list
        })
    })
})
//后台管理
router.post('/web/api/test', (req, res, next) => {
    let username = req.body.username;
    let password = req.body.password;
    User.findOne({
        name: username
    }, (err, user) => {
        console.log(user);
        if (user) { //已经注册
            if (user.password !== password) { //密码错误
                res.send({
                    err_code: 0,
                    message: '用户名或密码不正确!'
                });
            } else { //登录成功
                req.session.userID = user._id;
                res.send({
                    status: 200,
                    data: {
                        token: user._id,
                        username: user.name,
                        tel: user.tel,
                    }
                });
            }
        } else {
            res.send({
                status: 0,
                message: '没有该用户'
            });
        }
    })
})
//自动登录
router.get('/web/api/userInfo', (req, res) => {
    console.log(req.session.userID);
    // 1. 取出userId
    const userId = req.session.userID;
    // 2. 查询
    User.findOne({
        _id: userId
    }, (err, user) => {
        if (!user) {
            // 清除上一次的userId
            delete req.session.userid;
            res.send({
                status: 401,
                message: '请先登录啊'
            });
        } else {
            res.send({
                status: 200,
                data: {
                    token: user._id,
                    username: user.name,
                    tel: user.tel,
                }
            });
        }
    })
});
//退出登录
router.get('/web/api/logout', (req, res, next) => {
    req.session.userID = null;
    res.json({
        status: 200,
        message: '退出登录成功'
    })
})
//科室编辑
router.post('/web/api/changeSpecailty', (req, res, next) => {
    if (req.session.userID) {
        let s_id = req.body.s_id;
        let oldDepartment = req.body.oldDepartment;
        let newDepartment = req.body.newDepartment;
        let s_name = req.body.s_name;
        let s_introduction = req.body.introduction;
        if (oldDepartment==newDepartment) {
            console.log(2);
            db.collection('departments').updateOne({department:newDepartment,"specialty.specialty_id":s_id},{
                $set: {"specialty.$.specialty_name":s_name,"specialty.$.introduction":s_introduction}
            })
        }else{
            let new_s = {specialty_id:s_id,specialty_name:s_name,introduction:s_introduction};
            db.collection('departments').updateOne({department:newDepartment},{$addToSet:{specialty:new_s}});
            db.collection('departments').updateOne({department:oldDepartment},{$pull:{specialty:{specialty_id:s_id}}});
            console.log(3);
        }
        db.collection('doctors').updateMany({dPmtid:s_id},{$set:{dDepartment:s_name}});
        res.send({
            status:200,
            message:'修改成功'
        })
    } else {
        res.send({
            status: 401,
            message: '登录已经过期，请重新登录'
        })
    }

})

export default router;