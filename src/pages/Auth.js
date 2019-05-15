import React, { Component } from "react";

import AuthContext from "../context/auth-context";
import "./Auth.css";

export default class AuthPage extends Component {
  state = { isLogin: true };

  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.emailEL = React.createRef();
    this.passwordEL = React.createRef();
  }
  submitHandler = event => {
    event.preventDefault();

    const email = this.emailEL.current.value;
    const password = this.passwordEL.current.value;

    if (email.trim().length === 0 || password.trim().length === 0) {
      return;
    }

    let requestBody = {
      query: `
        query Login($email: String!,$password: String!) {  
          login(email: $email, password: $password){
            userId
            token
            tokenExpiration
          }}
      `,
      variables: {
        email: email,
        password: password
      }
    };

    if (!this.state.isLogin) {
      requestBody = {
        query: `
      mutation CreateUser($email: String! , $password: String!){
        createUser(userInput:{email: $email ,password: $password}){
          _id
          email
        }
      }
      `,
        variables: {
          email: email,
          password: password
        }
      };
    }

    fetch("http://localhost:8000/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed!");
        }
        return res.json();
      })
      .then(resData => {
        console.log(resData);
        if (this.state.isLogin) {
          if (resData.data.login.token) {
            this.context.login(
              resData.data.login.token,
              resData.data.login.userId,
              resData.data.login.tokenExpiration
            );
          }
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  switchModeHandler = () => {
    this.setState(prevState => {
      return { isLogin: !prevState.isLogin };
    });
  };

  render() {
    return (
      <form className="auth-form" onSubmit={this.submitHandler}>
        <div className="form-control">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" ref={this.emailEL} />
        </div>
        <div className="form-control">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" ref={this.passwordEL} />
        </div>
        <div className="form-actions">
          <button type="submit">Submit</button>
          <button type="button" onClick={this.switchModeHandler}>
            Switch to {this.state.isLogin ? "Signup" : "Login"}
          </button>
        </div>
      </form>
    );
  }
}
