import mongoose from 'mongoose'

// 创建管理员(用户)的模式对象
const SpecialtySchema = mongoose.Schema({
    // 科室名
    department: {type: String},
    // 专科
    specialty:{type:Object},
    //主治医生
    doctor:{type:String}
});

const Specialty = mongoose.model('specialty', SpecialtySchema);
export default Specialty;