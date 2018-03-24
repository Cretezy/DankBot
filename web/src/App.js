import React, { Component } from "react";
import {
  createMuiTheme,
  CssBaseline,
  MuiThemeProvider,
  Typography,
  withStyles
} from "material-ui";
import { Supported } from "./components/Supported";
import { Unsupported } from "./components/Unsupported";
import red from "material-ui/colors/red";

const theme = createMuiTheme({
  palette: {
    primary: red
  },
  spacing: {
    unit: 12
  }
});

const styles = theme => ({
  root: {
    height: "95vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: theme.spacing.unit * 2,
    "@media (min-width: 600px)": {
      paddingTop: theme.spacing.unit * 4
    },
    "@media (min-width: 1000px)": {
      paddingTop: theme.spacing.unit * 6
    }
  },
  title: {
    // paddingBottom: theme.spacing.unit
  }
});

const supportsPush =
  "serviceWorker" in navigator &&
  "showNotification" in ServiceWorkerRegistration.prototype &&
  "PushManager" in window;

const App = withStyles(styles)(
  class extends Component {
    render() {
      const { classes } = this.props;

      return (
        <MuiThemeProvider theme={theme}>
          <div className={classes.root}>
            <Typography variant="display2" className={classes.title}>
              Dank Bot
            </Typography>
            {supportsPush ? <Supported /> : <Unsupported />}
          </div>
        </MuiThemeProvider>
      );
    }
  }
);

export default class Root extends Component {
  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </MuiThemeProvider>
    );
  }
}
