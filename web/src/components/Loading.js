import React, { PureComponent } from "react";
import { CircularProgress, withStyles } from "material-ui";

const styles = theme => ({
  loading: {
    marginTop: theme.spacing.unit
  }
});

export const Loading = withStyles(styles)(
  class extends PureComponent {
    render() {
      return (
        <div className={this.props.classes.loading}>
          <CircularProgress />
        </div>
      );
    }
  }
);
