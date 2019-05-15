import React, { Component } from "react";
import AuthContext from "../context/auth-context";
import Spinner from "../components/Spinner/Spinner";
import BookingList from "../components/Bookings/BookingList/BookingList";
import BookingsChart from "../components/Bookings/BookingsChart/BookingsChart";
import BookingsControl from "../components/Bookings/BookingsControl/BookingsControl";

export default class BookingsPage extends Component {
  state = {
    isLoading: false,
    bookings: [],
    outputType: "list"
  };

  isActive = true;

  static contextType = AuthContext;

  componentDidMount() {
    this.fetchBookings();
  }

  fetchBookings = () => {
    this.setState({ isLoading: true });
    const requestBody = {
      query: `
      {
  bookings{
    _id
    createdAt
    updatedAt
    event{
      _id
      title
      price
    }
    user{
      email
    }
  }
}

`
    };

    const token = this.context.token;

    fetch("http://localhost:8000/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed!");
        }
        return res.json();
      })
      .then(resData => {
        const bookings = resData.data.bookings;
        if (this.isActive) {
          this.setState({
            isLoading: false,
            bookings: bookings
          });
        }
      })
      .catch(error => {
        console.log(error);
        if (this.isActive) {
          this.setState({ isLoading: false });
        }
      });
  };

  componentWillUnmount() {
    this.isActive = false;
  }

  deleteBookingHandler = bookingId => {
    this.setState({ isLoading: true });
    const requestBody = {
      query: `mutation CancelBooking($id:ID!) {
  cancelBooking(bookingId:$id){
    _id
    title
  }
}`,
      variables: {
        id: bookingId
      }
    };

    const token = this.context.token;

    fetch("http://localhost:8000/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed!");
        }
        return res.json();
      })
      .then(resData => {
        this.setState(prevState => {
          const updatedBookings = prevState.bookings.filter(
            booking => booking._id !== bookingId
          );
          return { bookings: updatedBookings, isLoading: false };
        });
      })
      .catch(error => {
        console.log(error);
        if (this.isActive) {
          this.setState({ isLoading: false });
        }
      });
  };

  changeOutputTypeHandler = outputType => {
    if (outputType === "list") {
      this.setState({ outputType: "list" });
    } else {
      this.setState({ outputType: "chart" });
    }
  };

  render() {
    let content = <Spinner />;
    if (!this.state.isLoading) {
      content = (
        <React.Fragment>
          <BookingsControl
            onChange={this.changeOutputTypeHandler}
            activeOutputType={this.state.outputType}
          />

          {this.state.outputType === "list" ? (
            <BookingList
              onDelete={this.deleteBookingHandler}
              bookings={this.state.bookings}
            />
          ) : (
            <BookingsChart bookings={this.state.bookings} />
          )}
        </React.Fragment>
      );
    }
    return <React.Fragment>{content}</React.Fragment>;
  }
}
