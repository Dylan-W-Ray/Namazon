import './NamazonUI.css'
import React from 'react'
import axios from 'axios';
import ScrollArea from 'react-scrollbar'

class PurchaseArea extends React.Component {
    constructor(props) {
        super(props)
        this.state={
            purchaseQuantity:''
        }
        this.addToCart=this.addToCart.bind(this)
        this.quantityInputHandler=this.quantityInputHandler.bind(this)
    }

    async addToCart() {
        try {
            const purchaseBody= {
                item: this.props.item,
                quantity: this.state.purchaseQuantity
            }
            const headers= {
                'Authorization':`Bearer: ${this.props.jwToken}`
            }
            const response=(await axios.post(`http://localhost:8080/user/${this.props.userId}/cart/${this.props.cartId}/cartItem`, purchaseBody, {headers})).data
            this.props.updateStore()
            this.props.updateCart()
            }
            catch(e) {
            alert(e.response.data)
            }
        }


       quantityInputHandler(Event) {
        this.setState({purchaseQuantity: Event.target.value})
    }

    render() {
        return(
            <div>
                <button onClick={this.addToCart}>Add To Cart</button>
                <input placeholder="Quantity" type="number" onBlur={this.quantityInputHandler}/>
            </div>
        )
    }
}

export default class Store extends React.Component {
    constructor(props) {
        super(props)
        this.state={
            storeItems:'',
            itemQuery:'',
            sortedAZ:false,
            scrollArea: {
                borderRadius: 2,
                height: '299px',
                width: '300px',
                border: 'solid',
                borderColor:'red'
            }
        }
        this.getCurrentStore=this.getCurrentStore.bind(this)
        this.setItemQuery=this.setItemQuery.bind(this)
        this.findItem=this.findItem.bind(this)
        this.sortStore=this.sortStore.bind(this)
    }

    async getCurrentStore(){
        try {
            const headers= {
                'Authorization':`Bearer: ${this.props.jwToken}`
            }
            const response=(await axios.get(`http://localhost:8080/StoreItems`,{headers})).data
            const storeItemsList=[]
            response.forEach(storeItem=>{
                storeItemsList.push(<li>
                    {storeItem.item}:
                    {storeItem.inStock}
                    <PurchaseArea item={storeItem.item}
                                  updateStore={this.getCurrentStore}
                                  updateCart={this.props.updateCartToggle}
                                  jwToken={this.props.jwToken}
                                  userId={this.props.userId}
                                  cartId={this.props.cartId}/>
                </li>)
                })
            this.setState({storeItems:storeItemsList})
            this.setState({isSorted:false})

        }
        catch(e) {
            alert(e.response.data)
        }
    }

    updateStore() {
        if(this.props.updateStore) {
            this.getCurrentStore()
            this.props.updateStoreToggle()
        }
    }

    setItemQuery(Event) {
        this.setState({itemQuery:Event.target.value})
    }

    async sortStore() {
     if(!this.state.sortedAZ) {
         try {
             const headers= {
                 'Authorization':`Bearer: ${this.props.jwToken}`
             }
             const response=(await axios.get(`http://localhost:8080/StoreItems`,{headers})).data
             response.sort((itemA,itemB)=> {
                 return(itemA.item>itemB.item)
             })
             const storeItemsList=[]
             response.forEach(storeItem=>{
                 console.log(storeItem.item)
                 storeItemsList.push(<li>
                     {storeItem.item}:
                     {storeItem.inStock}
                     <PurchaseArea item={storeItem.item}
                                   updateStore={this.getCurrentStore}
                                   updateCart={this.props.updateCartToggle}
                                   jwToken={this.props.jwToken}
                                   userId={this.props.userId}
                                   cartId={this.props.cartId}/>
                 </li>)
             })
             this.setState({storeItems:storeItemsList})
         }
         catch {

         }
     }

     }

    async findItem() {
        try {
            const headers= {
                'Authorization':`Bearer: ${this.props.jwToken}`
            }
            const response=(await axios.get(`http://localhost:8080/StoreItem?item=${this.state.itemQuery}`,{headers})).data
            const storeItemsList=[]
            response.forEach(storeItem=>{
                storeItemsList.push(<li>
                    {storeItem.item}:
                    {storeItem.inStock}
                    <PurchaseArea item={storeItem.item}
                                  updateStore={this.getCurrentStore}
                                  updateCart={this.props.updateCartToggle}
                                  jwToken={this.props.jwToken}
                                  userId={this.props.userId}
                                  cartId={this.props.cartId}/>
                </li>)
            })
            this.setState({storeItems:storeItemsList})
        }
        catch(e){
        alert(e.response.data)
        }
    }


    render() {
        return (
            <div>
                <div>
                    <body className="storeArea" >
                    <h2>Namazon Marketplace!</h2>
                    <span>
                        <button onClick={this.getCurrentStore}>Show Store Items</button>
                        <button onClick={this.sortStore}>Toggle Sort a-z||z-a</button>
                        <div>
                            <button onClick={this.findItem}>Search</button>
                            <input placeholder="item" onBlur={this.setItemQuery}/>
                        </div>
                    </span>
                    <ScrollArea style={this.state.scrollArea} speed={0.8}>
                        <ul>
                            {this.state.storeItems}
                        </ul>
                    </ScrollArea>
                    </body>
                </div>
                {this.updateStore()}
            </div>
        )
    }
}
