import mongoose from 'mongoose'

// 创建管理员(用户)的模式对象
const UserSchema = mongoose.Schema({
    // 用户名
    name: {type: String},
    // 密码
    password:{type:String},
    // tel
    tel:{type:Number}
});

const User = mongoose.model('user', UserSchema);
export default User;