import React, { Fragment, PureComponent } from "react";
import { Button, CircularProgress, Typography, withStyles } from "material-ui";
import firebase from "../firebase";
import { Feed } from "./Feed";

const styles = theme => ({
  title: {
    margin: theme.spacing.unit * 2
  },

  loading: {
    margin: theme.spacing.unit * 2
  }
});

export const Login = withStyles(styles)(
  class extends PureComponent {
    state = {
      loading: false,
      loadedFeed: false
    };

    async _onSetup() {
      try {
        this.setState({ loading: true });

        await firebase.messaging().requestPermission();
        const token = await firebase.messaging().getToken();

        const user = await firebase.auth().signInAnonymously();

        await firebase
          .firestore()
          .collection("users")
          .doc(user.uid)
          .set({
            token,
            morning: false,
            noon: false,
            afternoon: false
          });
      } catch (error) {
        console.error(error);
        this.setState({ loading: false });
      }
    }

    _onFeedLoad() {
      this.setState({
        loadedFeed: true
      });
    }

    render() {
      const { classes } = this.props;
      return (
        <Fragment>
          <Typography variant="title" className={classes.title}>
            Welcome to Dank Bot!
          </Typography>
          <Button
            variant="raised"
            color="primary"
            onClick={this._onSetup.bind(this)}
            disabled={this.state.loading}
          >
            Get Started
          </Button>

          {(this.state.loading || !this.state.loadedFeed) && (
            <CircularProgress className={classes.loading} />
          )}
          <Feed onLoad={this._onFeedLoad.bind(this)} />
        </Fragment>
      );
    }
  }
);
