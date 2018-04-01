import React, { PureComponent } from "react";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Switch,
  withStyles
} from "material-ui";
import firebase from "../firebase";
import { Star as StarIcon, List as ListIcon } from "material-ui-icons";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const styles = theme => ({
  feed: {
    height: "100%",
    maxWidth: "400px",
    width: "100%",
    overflowY: "auto",
    marginTop: theme.spacing.unit * 2
  }
});

export const Feed = withStyles(styles)(
  class extends PureComponent {
    static defaultProps = {
      onLoad() {}
    };

    state = {
      feed: null,
      all: false
    };

    feed = firebase.firestore().collection("posts");

    componentDidMount() {
      // Listen to changes on feed
      this.unregisterFeedObserver = this.feed.onSnapshot(snapshot => {
        if (!this.state.feed) {
          this.props.onLoad();
        }

        this.setState({ feed: snapshot.docs.map(doc => doc.data()) });
      });
    }

    componentWillUnmount() {
      this.unregisterFeedObserver();
    }

    _toggleAll() {
      this.setState(state => ({ all: !state.all }));
    }

    render() {
      if (!this.state.feed) {
        return null;
      }

      const { classes } = this.props;

      const times = {
        morning: "Morning",
        noon: "Noon",
        afternoon: "Afternoon"
      };

      const settings = (this.state.all ? null : this.props.settings) || times;

      const posts = this.state.feed.filter(post => settings[post.time]);

      posts.sort((a, b) => b.date - a.date);

      const disableAll = Object.keys(times).every(time => settings[time]);

      return (
        <div className={classes.feed}>
          <List component="nav">
            {this.props.settings && (
              <ListItem button onClick={this._toggleAll.bind(this)}>
                <ListItemIcon>
                  <StarIcon />
                </ListItemIcon>
                <ListItemText primary={`All Posts`} />
                <ListItemSecondaryAction>
                  <Switch
                    onChange={this._toggleAll.bind(this)}
                    checked={this.state.all}
                    disabled={disableAll}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            )}
            {posts.map(post => (
              <ListItem
                key={post.id}
                button
                onClick={() => window.open(post.permalink, "_blank")}
              >
                <ListItemIcon>
                  {post.thumbnail ? (
                    <img alt="" src={post.thumbnail} />
                  ) : (
                    <ListIcon />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={`${formatDate(post.date)}, ${post.time}`}
                />
              </ListItem>
            ))}
          </List>
        </div>
      );
    }
  }
);

function formatDate(unix) {
  const date = new Date(unix);
  const month = date.getMonth();
  const day = date.getDate();
  return `${months[month]} ${day}`;
}
