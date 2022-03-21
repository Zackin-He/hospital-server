import mongoose from 'mongoose'

// 创建管理员(用户)的模式对象
const RegFormSchema = mongoose.Schema({
    // 患者姓名
    pName: {type: String},
    // 患者身份证
    pID:{type:String},
    //主治医生姓名
    pDocName:{type:String},
    //主治医生id
    pDocID:{type:Number},
    //科室id
    dID:{type:String},
    //科室
    dpmt:{type:String},
    //单号
    regNumber:{type:String},
    //预约时间
    regTime:{type:Date},
    //就诊日期
    treatDate:{type:Number},
    //就诊时间
    treatTime:{type:String},
    //患者手机号
    pTel:{type:Number}
});

const RegForm = mongoose.model('regForm', RegFormSchema);
export default RegForm;