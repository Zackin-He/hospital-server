import express from 'express'
import Departments from '../models/Departments';
const router = express.Router({});

router.get('/web/api/departmentList',(req,res)=>{
    Departments.find({},(err,list)=>{
        console.log(list[0]);
        res.send({
            success_code:200,
            data:list
        })
    })
})
export default router;