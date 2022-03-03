const mongoose=require('mongoose')
const storeItemSchema=require('./storeItem')

const cartItemSchema=new mongoose.Schema(
    {
        _id:false,
        storeItemId: {
            type: mongoose.Schema.ObjectId,
            ref: 'store-items'
        },
        quantity:Number,
    }
)

module.exports=cartItemSchema