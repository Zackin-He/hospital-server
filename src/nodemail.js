import RegForm from './../models/RegForm';
import db from './../db/db'
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
// 设置邮件内容
// let mailOptions = {
//   // 发件人地址，例如 1234<1234@163.com>
//   from: 'hezeting520@sina.com',
//   // 收件人地址，可以使用逗号隔开添加多个
//   // '***@qq.com, ***@163.com'
//   to: '2238565104@qq.com',
//   // 标题
//   subject: 'Hello World',
//   // 邮件内容可以自定义样式
//   html: '<strong style="color: red">测试"邮件轰炸机"</strong>'
// }
// 定时发送邮件
// 每秒执行一次
// 具体的各项设置查看上方的链接
let timeObj = {
  am1: 1000 * 60 * 60 * 9,
  am2: 1000 * 60 * 60 * 10,
  pm1: 1000 * 60 * 60 * 14,
  pm2: 1000 * 60 * 60 * 15
}
new cronJob('0 2/5 * * * *', () => {
  RegForm.find({}, (err, result) => {
    if (err) return next(Error(err));
    let nowTime = new Date().getTime();
    result.forEach((item) => {
      let treatTime = item.treatDate + timeObj[item.treatTime];
      if (treatTime - 1000 * 60 * 60 > nowTime && treatTime - 1000 * 60 *  65 < nowTime) {
        // 设置邮件内容
        let mailOptions = {
          // 发件人地址，例如 1234<1234@163.com>
          from: 'hezeting520@sina.com',
          // 收件人地址，可以使用逗号隔开添加多个
          // '***@qq.com, ***@163.com'
          to: item.pEmail,
          // 标题
          subject: '预约提醒',
          // 邮件内容可以自定义样式
          html: '<h2>距离您预约的就诊时间还有1小时，请合理安排您的时间到医院就诊</h2><p><span>就诊人：'+item.pName+'</span><br><span>就诊科室：'+item.dpmt+'</span><br></p>'
        }
        transport.sendMail(mailOptions, (error, response) => {
          if (error) {
            console.error(error)
          } else {
            console.log('Message Send Ok '+item.pEmail)
          }
          // 记得关闭连接
          transport.close();
        })
      }
    })
  })
  console.log(new Date());
}, null, true, 'Asia/Shanghai');