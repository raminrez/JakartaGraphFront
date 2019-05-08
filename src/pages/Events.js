import React, { Component, createRef } from "react";

import Backdrop from "../components/Backdrop/Backdrop";
import Modal from "../components/Modal/Modal";
import AuthContext from "../context/auth-context";
import Spinner from "../components/Spinner/Spinner";

import "./Events.css";
import EventList from "../components/Events/EventList/EventList";

export default class EventsPage extends Component {
  constructor(props) {
    super(props);
    this.titleELRef = createRef();
    this.descriptionELRef = createRef();
    this.priceELRef = createRef();
    this.dateELRef = createRef();
  }

  static contextType = AuthContext;

  componentDidMount() {
    this.fetchEvents();
  }

  state = {
    creating: false,
    events: [],
    isLoading: false
  };

  startCreateEventHandler = () => {
    this.setState({ creating: true });
  };

  modalConfirmHandler = () => {
    this.setState({ creating: false });
    const title = this.titleELRef.current.value;
    const date = this.dateELRef.current.value;
    const description = this.descriptionELRef.current.value;
    const price = +this.priceELRef.current.value;

    const event = {
      title,
      description,
      date,
      price
    };

    if (
      title.trim().length === 0 ||
      description.trim().length === 0 ||
      price <= 0 ||
      date.trim().length === 0
    ) {
      return;
    }
    console.log(event);

    const requestBody = {
      query: `
        mutation{
           createEvent(eventInput:{title:"${title}",description:"${description}",date:"${date}",price:${price}}){
            _id
            title
            description
            date
            price
            creator{
              _id
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
        this.setState(prevState => {
          const updatedEvents = [...prevState.events];
          updatedEvents.push({
            _id: resData.data.createEvent._id,
            title: resData.data.createEvent.title,
            date: resData.data.createEvent.date,
            description: resData.data.createEvent.description,
            price: resData.data.createEvent.price,
            creator: {
              _id: this.context.userId
            }
          });
          return { events: updatedEvents };
        });
      })
      .catch(error => {
        console.log(error);
      });
  };

  fetchEvents = () => {
    this.setState({ isLoading: true });
    const requestBody = {
      query: `
      query {
       events {
         _id
         title
         date
         description
         price
         creator {
          _id
          }
        }
      }

`
    };

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
        const events = resData.data.events;
        this.setState({
          events,
          isLoading: false
        });
      })
      .catch(error => {
        console.log(error);
        this.setState({ isLoading: false });
      });
  };

  modalCancelHandler = () => {
    this.setState({ creating: false, selectedEvent: false });
  };

  showDetailHandler = eventId => {
    this.setState(prevState => {
      const selectedEvent = prevState.events.find(e => e._id === eventId);

      return { selectedEvent };
    });
  };

  bookEventHandler = () => {};

  render() {
    return (
      <React.Fragment>
        {(this.state.creating || this.state.selectedEvent) && <Backdrop />}
        {this.state.creating && (
          <Modal
            title="Add Event"
            canCancel
            canConfirm
            onCancel={this.modalCancelHandler}
            onConfirm={this.modalConfirmHandler}
            confirmText="Confirm"
          >
            <form>
              <div className="form-control">
                <label htmlFor="title">Title</label>
                <input ref={this.titleELRef} id="title" type="text" />
              </div>
              <div className="form-control">
                <label htmlFor="price">Price</label>
                <input ref={this.priceELRef} id="price" type="number" />
              </div>
              <div className="form-control">
                <label htmlFor="date">Date</label>
                <input ref={this.dateELRef} id="date" type="datetime-local" />
              </div>
              <div className="form-control">
                <label htmlFor="description">Description</label>
                <textarea
                  ref={this.descriptionELRef}
                  id="description"
                  rows="4"
                />
              </div>
            </form>
          </Modal>
        )}
        {this.state.selectedEvent && (
          <Modal
            title={this.state.selectedEvent.title}
            canCancel
            canConfirm
            onCancel={this.modalCancelHandler}
            onConfirm={this.bookEventHandler}
            confirmText="Book"
          >
            <h1>{this.state.selectedEvent.title}</h1>
            <h2>
              ${this.state.selectedEvent.price} -{" "}
              {new Date(this.state.selectedEvent.date).toLocaleDateString()}
            </h2>
            <p>{this.state.selectedEvent.description}</p>
          </Modal>
        )}
        {this.context.token && (
          <div className="events-control">
            <p>Share you own Events!</p>
            <button
              type="button"
              className="btn"
              onClick={this.startCreateEventHandler}
            >
              Create Event
            </button>
          </div>
        )}
        {this.state.isLoading ? (
          <Spinner />
        ) : (
          <EventList
            events={this.state.events}
            authUserId={this.context.userId}
            onViewDetail={this.showDetailHandler}
          />
        )}
      </React.Fragment>
    );
  }
}
