import mongoose from 'mongoose'

// 创建管理员(用户)的模式对象
const DoctorSchema = mongoose.Schema({
    // 医生姓名
    dName: {type: String},
    //医生职称
    docTitle:{type:String},
    // 医生编号
    dID:{type:Number},
    //性别
    dGender:{type:String},
    //所属科室
    dDepartment:{type:String},
    //所属科室编号
    dPmtid:{type:String},
    //电话
    dTel:{type:String},
    //排班情况
    dScheduling:{type:Array},
    // [{date:"3/8",isvisit:true,am:3,pm:9}]
    //简介
    dIntroduction:{type:String}

});

const Doctor = mongoose.model('doctor', DoctorSchema);
export default Doctor;