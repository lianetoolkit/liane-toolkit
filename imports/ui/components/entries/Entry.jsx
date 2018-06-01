import React from "react";
import styled from "styled-components";
import moment from "moment";
import { Grid, Icon } from "semantic-ui-react";
import EntryInteractivityCounts from "./EntryInteractivityCounts.jsx";

const Wrapper = styled.div`
  width: 100%;
  &:hover {
    .entry-interactivity {
      opacity: 1;
    }
  }
  .entry-interactivity {
    opacity: .5;
  }
  .entry-content {
    margin: 0 0 1rem;
  }
  .entry-meta {
    margin: .25rem 0;
    font-size: 0.8em;
    color: #999;
  }
`;

export default class Entry extends React.Component {
  _content() {
    const { entry } = this.props;
    if (entry.message) {
      return entry.message.substring(0, 90) + "...";
    }
    return "";
  }
  _url() {
    const { entry } = this.props;
    const params = entry._id.split("_");
    return `https://facebook.com/${params[0]}/posts/${params[1]}`;
  }
  render() {
    const { entry } = this.props;
    return (
      <Wrapper>
        <Grid columns={2}>
          <Grid.Row>
            <Grid.Column>
              <div className="entry-content">
                <p>
                  {this._content()}{" "}
                  <a href={this._url()} target="_blank">
                    <Icon name="facebook" />
                  </a>
                </p>
              </div>
            </Grid.Column>
            <Grid.Column>
              <div className="entry-meta">
                <p>{moment(entry.createdTime).fromNow()}</p>
              </div>
              <div className="entry-interactivity">
                <EntryInteractivityCounts entry={entry} />
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Wrapper>
    );
  }
}
