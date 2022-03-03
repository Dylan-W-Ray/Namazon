import './NamazonUI.css'
import React from 'react'
import axios from 'axios'
import ScrollArea from 'react-scrollbar'

export default class Cart extends React.Component {
    constructor(props) {
        super(props)
        this.state={
            cartTitle: 'Cart Window',
            cartId: '',
            cartItems: '',
            scrollArea: {
                borderRadius: 2,
                height: '299px',
                width: '300px',
                border: 'solid',
                borderColor:'red'
            }
        }
        this.getCurrentCart=this.getCurrentCart.bind(this)
        this.deleteItem=this.deleteItem.bind(this)
    }

    async getCurrentCart() {
        try {
            const headers= {
                'Authorization':`Bearer: ${this.props.jwToken}`
            }
            const response=(await axios.get(`http://localhost:8080/user/${this.props.currentUserId}/cart`, {headers})).data
                this.setState({cartTitle: response.title})
                this.setState({cartId: response._id})
                const cartItemsList=[]
                response.cartItems.forEach(cartItem=>{
                    cartItemsList.push(<li>
                        {cartItem.storeItemId.item}:
                        {cartItem.quantity}
                        <span className="deleteButton">
                            <button onClick={this.deleteItem} data-itemid={cartItem.storeItemId._id}>Remove Item</button>
                    </span>
                    </li>)
                })
                this.setState({cartItems: cartItemsList})
            if(this.state.cartItems.length===0) {
                alert('Oh no, your cart is empty!\n'+
                      'You better start shopping.')
            }


        }
        catch(e) {
            console.log(e)
        }
    }

    async deleteItem(event) {
        const itemId=event.target.dataset.itemid
        try {
            const headers={
                'Authorization': `Bearer: ${this.props.jwToken}`
            }
            const response=(await axios.delete(`http://localhost:8080/user/${this.props.currentUserId}/cart/${this.state.cartId}/cartItem/${itemId}`, {headers})).data
            await this.getCurrentCart()
            this.props.updateStore()
        }
        catch(e) {
            alert(e.response.data)
        }
    }

    updateCart() {
        if(this.props.updateCart) {
            this.getCurrentCart()
            this.props.updateCartToggle()
        }
    }

    render() {
        return (
            <div>
                <div>
                    <body className="cartArea" >
                    <h1>{this.state.cartTitle}</h1>
                    <span>
                    <button>Empty Cart</button>
                    <button onClick={this.getCurrentCart}>Show Cart</button>
                    </span>
                    <ScrollArea style={this.state.scrollArea} speed={0.8}>
                        <ul>
                            {this.state.cartItems}
                        </ul>
                    </ScrollArea>
                    </body>
                </div>
                {this.updateCart()}
            </div>
        )
    }
}