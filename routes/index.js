import express from 'express'
import Departments from '../models/Departments';
import User from '../models/User';
import db from '../db/db';
import {
    route
} from 'express/lib/application';
import Doctor from '../models/Doctor';
const router = express.Router({});
let nodemailer = require('nodemailer'),
  smtpTransport = require('nodemailer-smtp-transport'),
  cronJob = require('cron').CronJob;

// SMTP 连接
let transport = nodemailer.createTransport(smtpTransport({
  // 主机
  host: 'smtp.sina.com',
  // 是否使用 SSL
  secure: false,
  secureConnection: false,
  // 网易的SMTP端口
  port: 25,
  auth: {
    // 账号
    user: 'hezeting520@sina.com',
    // 授权码(自行百度邮箱SMTP的授权码设置)，此处非密码
    pass: '3d1da5125a43f116'
  }
}));

//用户获取科室列表
router.get('/web/api/getDepartments', (req, res) => {
    Departments.find({}, (err, list) => {
        console.log(list[0]);
        res.send({
            success_code: 200,
            data: list
        })
    })
});

//管理员获取科室列表
router.get('/web/api/departmentList', (req, res) => {
    if (req.session.userID) {
        Departments.find({}, (err, list) => {
            console.log(list[0]);
            res.send({
                success_code: 200,
                data: list
            })
        })
    }else{
        res.send({
            status:401,
            message:'请重新登录'
        })
    }
});

//后台管理
router.post('/web/api/test', (req, res, next) => {
    let username = req.body.username;
    let password = req.body.password;
    let user_type = req.body.user_type;
    if (user_type === 'admin') {
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
                    req.session.user_type = user_type;
                    res.send({
                        status: 200,
                        data: {
                            token: user._id,
                            username: user.name,
                            tel: user.dTel,
                            type: user_type
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
    }else if (user_type === 'doctor') {
        Doctor.findOne({
            dID: username
        }, (err, user) => {
            console.log(user);
            if (user) { //已经注册
                if (user.dPassword !== password) { //密码错误
                    res.send({
                        err_code: 0,
                        message: '用户名或密码不正确!'
                    });
                } else { //登录成功
                    req.session.userID = user._id;
                    req.session.user_type = user_type
                    res.send({
                        status: 200,
                        data: {
                            token: user._id,
                            username: user.dName,
                            dID:user.dID,
                            tel: user.tel,
                            type: user_type,
                            doc:user
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
    }
})
//自动登录
router.get('/web/api/userInfo', (req, res) => {
    console.log(req.session.userID);
    // 1. 取出userId
    const userId = req.session.userID;
    const user_type = req.session.user_type
    // 2. 查询
    if (user_type==='admin') {
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
                        type:'admin'
                    }
                });
            }
        })
    }else if (user_type==='doctor') {
        Doctor.findOne({
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
                        username: user.dName,
                        dID:user.dID,
                        tel: user.dTel,
                        type:'doctor',
                        doc:user
                    }
                });
            }
        })
    }
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
        if (oldDepartment == newDepartment) {
            console.log(2);
            db.collection('departments').updateOne({
                department: newDepartment,
                "specialty.specialty_id": s_id
            }, {
                $set: {
                    "specialty.$.specialty_name": s_name,
                    "specialty.$.introduction": s_introduction
                }
            })
        } else {
            let new_s = {
                specialty_id: s_id,
                specialty_name: s_name,
                introduction: s_introduction
            };
            db.collection('departments').updateOne({
                department: newDepartment
            }, {
                $addToSet: {
                    specialty: new_s
                }
            });
            db.collection('departments').updateOne({
                department: oldDepartment
            }, {
                $pull: {
                    specialty: {
                        specialty_id: s_id
                    }
                }
            });
            console.log(3);
        }
        db.collection('doctors').updateMany({
            dPmtid: s_id
        }, {
            $set: {
                dDepartment: s_name
            }
        });
        res.send({
            status: 200,
            message: '修改成功'
        })
    } else {
        res.send({
            status: 401,
            message: '登录已经过期，请重新登录'
        })
    }

})

//门诊添加
router.post('/web/api/addDepartment', (req, res, next) => {
    if (req.session.userID) {
        let departmentName = req.body.departmentName;
        Departments.find({
            department: departmentName
        }, (err, result) => {
            if (err) return next(Error(err));
            if (result.length > 0) {
                res.send({
                    status: 400,
                    message: '添加失败，该门诊已存在！'
                })
            } else {
                db.collection('departments').insert({
                    department: departmentName,
                    specialty: []
                });
                res.send({
                    status: 200,
                    message: '添加门诊成功'
                })
            }
        })
    } else {
        res.send({
            status: 401,
            message: '登录已经过期，请重新登录'
        })
    }
})
//门诊添加
router.post('/web/api/addSpecialty', (req, res, next) => {
    if (req.session.userID) {
        let departmentName = req.body.departmentName;
        let specialtyName = req.body.specialtyName;
        let specialtyID = req.body.specialtyID;
        let introduction = req.body.introduction;
        let flag = true;
        Departments.find({
            "specialty.specialty_id": specialtyID
        }, (err, result) => {
            if (result.length > 0) {
                res.send({
                    status: 400,
                    message: '该科室id已经存在！'
                })
            } else {
                let new_s = {
                    specialty_id: specialtyID,
                    specialty_name: specialtyName,
                    introduction: introduction
                };
                db.collection('departments').updateOne({
                    department: departmentName
                }, {
                    $addToSet: {
                        specialty: new_s
                    }
                });
                res.send({
                    status: 200,
                    message: "添加科室成功!"
                })
            }
        })
        

    } else {
        res.send({
            status: 401,
            message: '登录已经过期，请重新登录'
        })
    }
})
//删除科室
router.post('/web/api/deleteSpecialty',(req,res,next)=>{
    if (req.session.userID&&req.session.user_type==='admin') {
        let departmentName = req.body.departmentName;
        let specialtyID = req.body.specialtyID;
        db.collection('departments').updateOne({
            department: departmentName
        }, {
            $pull: {
                specialty: {
                    specialty_id: specialtyID
                }
            }
        });
        db.collection('doctors').updateMany({
            dPmtid: specialtyID
        }, {
            $set: {
                dPmtid:'0000',
                dDepartment: '大学城综合科室'
            }
        });
        res.send({
            status:200,
            message:'删除科室成功'
        })
    }else{
        res.send({
            status:401,
            message:'请重新登录!'
        })
    }
    
})
/*生成指定长度的随机数*/
function randomCode(length) {
    let chars = ['0','1','2','3','4','5','6','7','8','9'];
    let result = "";
    for(let i = 0; i < length ; i ++) {
        let index = Math.ceil(Math.random()*9);
        result += chars[index];
    }
    return result;
}
let user = {}
//获取验证码
router.post('/web/api/getCode',(req,res,next)=>{
    let email = req.body.email;
    let code = randomCode(6);
    req.session.code = code;
    req.session.email = email;
    // 设置邮件内容
    let mailOptions = {
        // 发件人地址，例如 1234<1234@163.com>
        from: 'hezeting520@sina.com',
        // 收件人地址，可以使用逗号隔开添加多个
        // '***@qq.com, ***@163.com'
        to: email,
        // 标题
        subject: '验证码',
        // 邮件内容可以自定义样式
        html: '<p>您的验证码是'+code+'</p>'
      }
      transport.sendMail(mailOptions, (error, response) => {
        if (error) {
          console.error(error)
        } else {
          console.log('Message Send Ok ');
        }
        // 记得关闭连接
        transport.close();
      });
      res.send({
          status:200,
          message:'验证码获取成功',
          code:code
      })
})
//根据验证码登录
router.post('/web/api/loginByEmail',(req,res,next)=>{
    let email = req.body.email;
    let code = req.body.code;
    console.log(req.session.email,req.session.code);
    if (email!==req.session.email||code!==req.session.code) {
        res.send({
            status:400,
            message:'验证码不正确!'
        })
    }else{
        res.send({
            status:200,
            email:email
        })
    }
})
export default router;