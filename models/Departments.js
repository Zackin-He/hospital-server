import mongoose from 'mongoose'

// 创建管理员(用户)的模式对象
const departmentsSchema = mongoose.Schema({
    // 科室名
    department: {type: String},
    // 专科
    specialty:{type:Object},
});

const Departments = mongoose.model('departments', departmentsSchema);
export default Departments;