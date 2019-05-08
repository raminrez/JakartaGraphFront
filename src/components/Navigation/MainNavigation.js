import React, { Component } from "react";
import { NavLink } from "react-router-dom";

import AuthContext from "../../context/auth-context";
import "./MainNavigation.css";

export default class mainNavigation extends Component {
  render() {
    return (
      <AuthContext.Consumer>
        {context => {
          return (
            <header className="main-navigation">
              <div className="main-navigation__logo">
                <h1> Easy Event</h1>
              </div>
              <nav className="main-navigation__items">
                <ul>
                  {!context.token && (
                    <li>
                      <NavLink to="/auth">Authenticate</NavLink>
                    </li>
                  )}
                  <li>
                    <NavLink to="/events">Events</NavLink>
                  </li>
                  {context.token && (
                    <React.Fragment>
                      <li>
                        <NavLink to="/bookings"> Booking</NavLink>
                      </li>
                      <li>
                        <button type="button" onClick={context.logout}>
                          Logout
                        </button>
                      </li>
                    </React.Fragment>
                  )}
                </ul>
              </nav>
            </header>
          );
        }}
      </AuthContext.Consumer>
    );
  }
}
