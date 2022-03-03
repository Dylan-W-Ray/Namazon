const mongoose=require('mongoose')

const storeItemSchema=new mongoose.Schema(
    {
        item:String,
        inStock:Number
    }
)

const storeItemModel=mongoose.model('store-items',storeItemSchema)

module.exports=storeItemModel