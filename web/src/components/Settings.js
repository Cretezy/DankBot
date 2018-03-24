import React, { Fragment, PureComponent } from "react";
import {
  Button,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  Switch,
  Typography,
  withStyles
} from "material-ui";
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

export const Settings = withStyles(styles)(
  class extends PureComponent {
    state = {
      loading: false,
      loadedFeed: false,
      settings: null
    };

    user = firebase.auth().currentUser;
    settings = firebase
      .firestore()
      .collection("users")
      .doc(this.user.uid);

    componentDidMount() {
      // Listen to changes on user's settings
      this.unregisterSettingsObserver = this.settings.onSnapshot(snapshot => {
        this.setState({ settings: snapshot.data() });
      });

      this.unregisterTokenObserver = firebase
        .messaging()
        .onTokenRefresh(async () => {
          await firebase.messaging().requestPermission();
          const token = await firebase.messaging().getToken();
          console.log(token);
          await this.settings.update({
            token
          });
        });
    }

    componentWillUnmount() {
      this.unregisterSettingsObserver();
      this.unregisterTokenObserver();
    }

    async _onLogout() {
      this.setState({ loading: true });

      await this.settings.delete();

      this.user.delete();
    }

    _onSwitch(time) {
      return event => {
        this.settings.update({
          [time]: event.target.checked
        });
      };
    }

    _onFeedLoad() {
      this.setState({
        loadedFeed: true
      });
    }

    render() {
      const { classes } = this.props;

      const times = {
        morning: "Morning",
        noon: "Noon",
        afternoon: "Afternoon"
      };

      const timeToggles = this.state.settings && (
        <FormGroup row>
          {Object.keys(times).map(time => (
            <FormControlLabel
              key={time}
              control={
                <Switch
                  checked={this.state.settings[time]}
                  onChange={this._onSwitch(time)}
                />
              }
              label={times[time]}
            />
          ))}
        </FormGroup>
      );

      return (
        <Fragment>
          <Typography variant="title" className={classes.title}>
            Welcome back!
          </Typography>
          {timeToggles}
          <Button
            onClick={this._onLogout.bind(this)}
            disabled={this.state.loading}
          >
            Logout
          </Button>
          {(!this.state.settings ||
            this.state.loading ||
            !this.state.loadedFeed) && (
            <CircularProgress className={classes.loading} />
          )}
          <Feed
            settings={this.state.settings}
            onLoad={this._onFeedLoad.bind(this)}
          />
        </Fragment>
      );
    }
  }
);
