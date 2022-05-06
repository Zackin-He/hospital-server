import mongoose from 'mongoose'

// 创建管理员(用户)的模式对象
const docImageSchema = mongoose.Schema({
    // 医生id
    dID: {type: String},
    // img
    imageData:{type:String},
});

const DocImage = mongoose.model('docImage', docImageSchema);
export default DocImage;