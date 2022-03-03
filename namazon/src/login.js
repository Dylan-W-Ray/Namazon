import React from 'react'
import axios from 'axios'


class UserLogin extends React.Component {
    constructor(props) {
        super(props)
        this.state={
            username: '',
            password: ''
        }
        this.loginHandler=this.loginHandler.bind(this)
        this.userInputHandler=this.userInputHandler.bind(this)
        this.passwordInputHandler=this.passwordInputHandler.bind(this)
    }

    async loginHandler() {
        const loginBodyData={
            username: this.state.username,
            password: this.state.password
        }
        try {
            const response=await axios.post('http://localhost:8080/user/login', loginBodyData)
            this.props.setToken(response.data.jwToken)
            this.props.setUser(response.data.user)
            this.props.loginOff()
        }
        catch(e){
            return (
                alert(e.response.data+"\nPlease provide a valid username and password\n"+
                    "username: firstName.LastName\n"+
                    "password: password1234")
            )
        }
    }

    userInputHandler(Event) {
        this.setState({username: Event.target.value})
    }

    passwordInputHandler(Event) {
        this.setState({password: Event.target.value})
    }

    showLogin() {
        if(this.props.loginVisibility) {
            return (
                <div className="Login">
                    <h1>Welcome to the Namazon Marketplace!</h1>
                    <input placeholder="Username" onBlur={this.userInputHandler}/>
                    <input type="password" placeholder="Password" onBlur={this.passwordInputHandler}/>
                    <button onClick={this.loginHandler}>Sign in</button>
                </div>
            )
        }
    }

    render() {
        return (
            <span>{this.showLogin()}</span>

        )
    }
}


export default class UserLoginContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            loginPrompt: true
        }
        this.loginPromptOff=this.loginPromptOff.bind(this)
    }

    loginPromptOff() {
        this.setState({loginPrompt: false})
        this.props.loginSuccess()

    }

    render() {
        return (
            <UserLogin loginVisibility={this.state.loginPrompt}
                       loginOff={this.loginPromptOff}
                       setToken={this.props.setToken}
                       setUser={this.props.setUser}
            />
        )

    }
}