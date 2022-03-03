const mongoose=require('mongoose')
const cartSchema=require('./cart')

const userSchema=new mongoose.Schema(
    {
        firstName:String,
        lastName:String,
        emailAddress:String,
        username:String,
        password:String,
       carts:[cartSchema]
    }
)

const userModel=mongoose.model('users',userSchema)

module.exports=userModel
module.exprts=userSchema