import React, { Component, Fragment } from "react";
import { CircularProgress, Typography, withStyles } from "material-ui";
import { Feed } from "./Feed";

const styles = theme => ({
  title: {
    margin: theme.spacing.unit
  },
  loading: {
    margin: theme.spacing.unit * 2
  }
});

export const Unsupported = withStyles(styles)(
  class extends Component {
    state = {
      loadedFeed: false
    };

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
            Unsupported browser!
          </Typography>
          <Typography>
            Upgrade to a modern browser or use another method to subscribe.
          </Typography>
          {!this.state.loadedFeed && (
            <CircularProgress className={classes.loading} />
          )}
          <Feed onLoad={this._onFeedLoad.bind(this)} />
        </Fragment>
      );
    }
  }
);
