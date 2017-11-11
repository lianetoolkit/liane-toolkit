import React, { Component } from "react";
import { Segment, Loader, Dimmer } from "semantic-ui-react";

export default class LoadingBlock extends Component {
  render() {
    const { size } = this.props;
    return (
      <Segment basic>
        <Dimmer active inverted>
          <Loader inline="centered" inverted size={size ? size : "medium"}>
            Loading
          </Loader>
        </Dimmer>
      </Segment>
    );
  }
}
