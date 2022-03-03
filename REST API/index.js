// File Name: index.js
//
// Author: Dylan W. Ray
// Date: 10/3/2020
// Assignment:RESTful API
// CS3320.001 Fall 2020
// Instructor: Jason Diaz


//Node modules setup.

//jwt setup
const jwt=require('jsonwebtoken')
const accessTokenSecret='@Ackermanns_Function!'

//express setup
const express=require('express')
const session=require('express-session')
const app=express()
app.use(express.json())
const router=express.Router()
const pathAuth=async(req,res,next) => {
    try {
        const authorizationHeader=req.headers.authorization
        if(authorizationHeader) {
            const jwtToken=authorizationHeader.split(' ')[1]
            const user=jwt.verify(jwtToken,accessTokenSecret)
            req.currentUser=user
        }
        else {
            res.status(403).send('AUTHORIZATION FAILURE')
        }
    }
    catch {
        res.status(403).send('UNAUTHORIZED REQUEST')
    }
    next()
}

//cors setup
const cors=require('cors')
app.use(cors())

//axios module setup.
const axios=require('axios')
//api key setup.
const config={
    headers:{
        'X-Api-Key':"75db5f50"
    }
}

//Mongoose module setup.
const mongoose=require('mongoose')
const MongoStore=require('connect-mongo')(session)
const userModel=require('./user.js')
const userSchema=require('./user')
const storeItemModel=require('./storeItem')
const cartSchema=require('./cart')
const cartItemSchema=require('./cartItem')

const url= //Secret goes here
let database;
const initializeDataBase=async() => {
    database= await mongoose.connect(url);
    if(database) {
        app.use(session({
            secret:'JawsOfLife-RingAnyBells-EasyAsPie',
            resave:true,
            saveUninitialized:true,
            store:new MongoStore({mongooseConnection:mongoose.connection})
        }))
        app.use(router)
        console.log('Successfully connected to the MongoDataBase')

    }
    else {
        console.log('ERROR: connection to MongoDataBase not established')
    }
}

//Function to collect and generate random data from the mockaroo api.
const generateData=async() => {
    const userData=await axios.get('https://my.api.mockaroo.com/FullNameAndEmail.json',config)
    const inventory=await axios.get('https://my.api.mockaroo.com/Inventory.json',config)
    const userCollection=[]
    const inventoryCollection=[]

    await userModel.deleteMany({})
    await storeItemModel.deleteMany({})
    //Filling the users collection array with user schemas.
    for(let i=0; i<userData.data.length; i++) {
        const newUser=userData.data[i]
        newUser.username=userData.data[i].firstName+"."+userData.data[i].lastName
        newUser.password='password1234'
        const masterCart=cartSchema
        masterCart.title='Master Cart'
        newUser.carts=[masterCart]
        userCollection.push(newUser)
    }
    await userModel.create(userCollection)

    //Filling the database store-items collection with storeItem schemas.
    for(let i=0; i<inventory.data.length; i++) {
        inventoryCollection.push(inventory.data[i])
    }
    await storeItemModel.create(inventoryCollection)
}


//Initializing and generating database collection.
initializeDataBase();
//DO NOT UNCOMMENT THIS FUNCTION OR THE CURRENT SET OF USABLE USERNAMES WILL BE RESET
//generateData();


//User REST calls:

//Custom GET to see all users.
router.get('/users',pathAuth,async (req,res)=> {
    const usersFound=await userModel.find().populate('carts.cartItems.storeItemId')
    if(usersFound.length===0) {
        res.status(404).send("****NO USERS FOUND****")
    }
    else {
        res.send(usersFound)
    }
})

//GET(1.1)
router.get('/user/:UserId',pathAuth,async (req,res)=> {
    const userFound=await userModel.findById(req.params.UserId).populate('carts.cartItems.storeItemId')
    userFound?userFound:res.status(404).send("****USER NOT FOUND****")

    res.send(userFound?userFound:404)
})

//POST(1.2)
router.post('/user',async (req,res)=> {
    const newUser=userSchema(req.body)
    const masterCart=cartSchema
    masterCart.title='Master Cart'
    newUser.carts=[masterCart]
    await userModel.create(newUser)

    const userPopulated=await userModel.findOne({_id:newUser._id})
    res.send(userPopulated?userPopulated:404);
})

router.post('/user/login',async(req,res) => {
    const {username,password}=req.body
    const userFound=await userModel.findOne({username,password})
    userFound?userFound:res.status(404).send("****USER NOT FOUND****")

    const accessToken=jwt.sign({userFound},accessTokenSecret)
    res.send({jwToken:accessToken,user:userFound})
})

//Cart REST calls:

//GET(2.1)
router.get('/user/:UserId/cart',pathAuth,async (req,res)=> {
    const userFound=await userModel.findById(req.params.UserId).populate('carts.cartItems.storeItemId')
    userFound?userFound:res.status(404).send("****USER NOT FOUND****")
    res.send(userFound.carts[0]?userFound.carts[0]:404)
})

//DELETE(2.2)
router.delete('/user/:UserId/cart',pathAuth,async (req,res)=> {
    const userFound=await userModel.findById(req.params.UserId)
    userFound?userFound:res.status(404).send("****USER NOT FOUND****")

    //Looping through the users cart and adding the inventory back to
    //the storeItem inStock count.
    for(let i=0;i<userFound.carts[0].cartItems.length;i++) {
        //Adding the item quantity in the users masterCart items array back to the store item.
        const inventoryFound=await storeItemModel.findById(userFound.carts[0].cartItems[i].storeItemId)
        inventoryFound.inStock+=userFound.carts[0].cartItems[i].quantity
        await storeItemModel.updateOne({_id:inventoryFound._id},inventoryFound)

    }

    userFound.carts[0].cartItems=[];
    await userModel.updateOne({_id:userFound._id},userFound)
    const updatedUserFound=await userModel.findById(req.params.UserId)
    res.send(updatedUserFound.carts[0]?updatedUserFound.carts[0]:404)
})

//cartItem REST calls:

//POST(3.1)
//NOTE:This path is slightly different from the path on the assignment sheet.
router.post('/user/:UserId/cart/:CartId/cartItem',pathAuth,async (req,res)=> {
    if(req.body.quantity<=0) {
        res.status(404).send("****EMPTY QUANTITY****")
    }
    else {
    const inventoryFound = await storeItemModel.findOne({item:req.body.item})
    inventoryFound ? inventoryFound : res.status(404).send("****ITEM NOT FOUND IN INVENTORY****")

    if(inventoryFound.inStock<=0) {
        res.status(404).send("****ITEM OUT OF STOCK****")
    }
    else if((inventoryFound.inStock-req.body.quantity)<0) {
        res.status(404).send("****ITEM QUANTITY NOT AVAILABLE****")
    }
    else {
        const userFound=await userModel.findById(req.params.UserId)
        userFound ? userFound : res.status(404).send("****USER NOT FOUND****")

        const cartFound=userFound.carts.id(req.params.CartId)
        cartFound ? cartFound : res.status(404).send("****CART NOT FOUND****")

        //Updating the in stock quantity of the proper store item.
        inventoryFound.inStock-=req.body.quantity
        await storeItemModel.updateOne({_id: inventoryFound._id}, inventoryFound)

        //Setting up the new cart item, and adding it to the proper cart.
        //and updating the user collection.
        const cartItem=cartItemSchema
        cartItem.storeItemId=inventoryFound._id
        cartItem.quantity=req.body.quantity
        cartFound.cartItems.push(cartItem)
        await userModel.updateOne({_id: userFound._id}, userFound)

        const updatedUserFound=await userModel.findById(req.params.UserId)
        const updatedCartFound=updatedUserFound.carts.id(req.params.CartId)


        res.send(updatedCartFound ? updatedCartFound : 404)
    }
    }
})

//DELETE(3.2)
//NOTE:This path is slightly different from the path on the assignment sheet.
router.delete('/user/:UserId/cart/:CartId/cartItem/:cartItemId',pathAuth,async (req,res)=> {
    const userFound=await userModel.findById(req.params.UserId)
    userFound?userFound:res.status(404).send("****USER NOT FOUND****")

    const cartFound=userFound.carts.id(req.params.CartId)
    cartFound?cartFound:res.status(404).send("****CART NOT FOUND****")

    const itemFound=cartFound.cartItems.find((item)=> {
        const jsonStringItem=JSON.stringify(item.storeItemId)
        if(jsonStringItem.includes(req.params.cartItemId)) {
            return item
        }
    })
    itemFound?itemFound:res.status(404).send("****ITEM NOT FOUND IN CART****")

    const inventoryFound=await storeItemModel.findById(itemFound.storeItemId)
    inventoryFound?inventoryFound:res.status(404).send("****ITEM NOT FOUND IN INVENTORY****")

    cartFound.cartItems.remove(itemFound)
    await userModel.updateOne({_id:userFound._id},userFound)

    inventoryFound.inStock+=itemFound.quantity
    await storeItemModel.updateOne({_id:inventoryFound._id},inventoryFound)


    const updatedUserFound=await userModel.findById(req.params.UserId)
    const updatedCartFound=updatedUserFound.carts.id(req.params.CartId)
    res.send(updatedCartFound?updatedCartFound:404)
})

//Store Items REST calls:

//Custom GET to see all store items.
router.get('/StoreItems',pathAuth,async (req,res)=> {
    const storeItemsFound=await storeItemModel.find()
    if(storeItemsFound.length===0) {
        res.status(404).send("****NO STORE ITEMS FOUND****")
    }
    else {
        res.send(storeItemsFound)
    }
})

//GET(4.1)
router.get('/StoreItem/:StoreItemID',pathAuth,async (req,res)=> {
    const itemFound=await storeItemModel.findById(req.params.StoreItemID)
    itemFound?itemFound:res.status(404).send("****ITEM NOT FOUND IN INVENTORY****")

    if(!req.session.lastStoreItemsViewed) {
        req.session.lastStoreItemsViewed=[itemFound]
    }
    else {
        if(req.session.lastStoreItemsViewed.length===10) {
            req.session.lastStoreItemsViewed.pop()
            req.session.lastStoreItemsViewed.unshift(itemFound)
        }
        else {
            req.session.lastStoreItemsViewed.unshift(itemFound)
        }
    }
    res.send(itemFound)
})

//GET(4.2)
router.get('/StoreItem',pathAuth,async (req,res)=> {
    const itemsFound=await storeItemModel.find({item:req.query.item})

    if(itemsFound.length===0) {
        res.status(404).send("****ITEMS NOT FOUND IN INVENTORY****")
    }
    else {
        res.send(itemsFound)
    }
})

//GET(2.2.1)
router.get('/StoreItems/Recent', pathAuth,async (req,res)=> {
    if(!req.session.lastStoreItemsViewed) {
        res.status(404).send( "****NOT RECENT VIEWED ITEMS****")
    }
    else if(parseInt(req.query.num)>=10) {
        res.send(req.session.lastStoreItemsViewed)
    }
    else {
        const itemsViewed=[]
        for(let i=0;i<req.query.num;i++) {
            itemsViewed.push(req.session.lastStoreItemsViewed[i])
        }
        res.send(itemsViewed)
    }


})

app.listen(8080)

//*NOTE* SAMPLE OBJECT FORMATS FOR REFERENCE:
//USE SAMPLE OBJECT FORMATS IF MOCKAROO API BREAKS.

/*
//SAMPLE USER:
const user={
    "firstName":"Bob",
    "lastName":"Parr",
    "emailAddress:":"Mr_Incredible@hotmail.com",
    "username":firstName.Lastname
    "password":"password1234"
    "carts":[
        {
            "cartTitle":"Master Cart",
            "cartItems":[]
        }
    ]
};

//SAMPLE CART ITEM:
const cartItem={
    "item":"Coke",
    "quantity":6,
    "storeItemId":3,
}

//SAMPLE STORE ITEM:
const storeItem={
    "storeItemId":0,
    "item":"Pepsi",
    "inStock":1000
}
*/
