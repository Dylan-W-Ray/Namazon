import React from 'react';
import UserLoginContainer from "./login";
import Store from "./Store";
import Cart from "./Cart";

export default class NamazonMasterUI extends React.Component {
    constructor(props) {
        super(props)
        this.state={
            isLoggedIn:false,
            jwToken: '',
            currentUser: '',
            cartNeedsUpdate:false,
            storeNeedsUpdate:false
        }
        this.setToken=this.setToken.bind(this)
        this.setUser=this.setUser.bind(this)
        this.loggedInToggle=this.loggedInToggle.bind(this)
        this.displayLogin=this.displayLogin.bind(this)
        this.displayMarketplace=this.displayMarketplace.bind(this)
        this.updateCartToggle=this.updateCartToggle.bind(this)
        this.updateStoreToggle=this.updateStoreToggle.bind(this)
    }

    setToken(token) {
        this.setState({jwToken:token})
    }
    setUser(user) {
        this.setState({currentUser:user})
    }

    loggedInToggle() {
        this.setState({isLoggedIn:!this.state.isLoggedIn})
    }

    updateCartToggle() {
        this.setState({cartNeedsUpdate:!this.state.cartNeedsUpdate})
    }

    updateStoreToggle() {
        this.setState({storeNeedsUpdate:!this.state.storeNeedsUpdate})
    }

    displayLogin() {
        if(!this.state.isLoggedIn) {
            return (
                    <UserLoginContainer setToken={this.setToken}
                                        setUser={this.setUser}
                                        loginSuccess={this.loggedInToggle}
                    />
            )
        }
    }

    displayMarketplace() {
        if(this.state.isLoggedIn) {
            return (
                <span>
                    <Cart className="TopCartLevel"
                          currentUserId={this.state.currentUser._id}
                          jwToken={this.state.jwToken}
                          updateCart={this.state.cartNeedsUpdate}
                          updateCartToggle={this.updateCartToggle}
                          updateStore={this.updateStoreToggle}
                    />

                    <Store className="TopStoreLevel"
                           jwToken={this.state.jwToken}
                           userId={this.state.currentUser._id}
                           cartId={this.state.currentUser.carts[0]._id}
                           updateCartToggle={this.updateCartToggle}
                           updateStore={this.state.storeNeedsUpdate}
                           updateStoreToggle={this.updateStoreToggle}
                    />
                </span>
            )
        }
    }

    userWelcome() {
        if(this.state.isLoggedIn) {
            return(
                <h1 className="Welcome">
                    Welcome to Namazon {this.state.currentUser.firstName} {this.state.currentUser.lastName}!
                </h1>
            )
        }
    }



    render() {
        return (
            <div>
                {this.displayLogin()}
                {this.userWelcome()}
                {this.displayMarketplace()}
            </div>
        )
    }
}