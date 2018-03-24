import React, { PureComponent } from "react";
import firebase from "../firebase";
import { Login } from "./Login";
import { Settings } from "./Settings";
import { Loading } from "./Loading";

export class Supported extends PureComponent {
  state = {
    loaded: false,
    user: null
  };

  componentDidMount() {
    this.unregisterAuthObserver = firebase.auth().onAuthStateChanged(user => {
      this.setState({ loaded: true, user });
    });
  }

  componentWillUnmount() {
    this.unregisterAuthObserver();
  }

  render() {
    const { loaded, user } = this.state;

    if (!loaded) {
      return <Loading />;
    }

    if (user) {
      return <Settings />;
    } else {
      return <Login />;
    }
  }
}
