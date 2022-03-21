import mongoose from 'mongoose'

// 创建管理员(用户)的模式对象
const PatientSchema = mongoose.Schema({
    // 患者姓名
    pName: {type: String},
    //性别
    pGender:{type:String},
    //身份证
    pIDCard:{type:String},
    //出生日期
    pBirthday:{type:String},
    //密码
    pPwd:{type:String}
});

const Patient = mongoose.model('patient', PatientSchema);
export default Patient;