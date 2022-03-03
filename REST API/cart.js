const mongoose=require('mongoose')
const cartItemSchema=require('./cartItem')

const cartSchema=new mongoose.Schema(
    {
        title:String,
        cartItems:[cartItemSchema]
    }
)

module.exports=cartSchema