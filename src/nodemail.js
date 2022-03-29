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
  port: 465, 
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
new cronJob('* * * * * *', () => {
  transport.sendMail(mailOptions, (error, response) => {
    if (error) {
      console.error(error)
    } else {
      console.log('Message Send Ok')
    }
    // 记得关闭连接
    transport.close();
  })
}, null, true, 'Asia/Shanghai');