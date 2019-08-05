import React, { Component } from "react";
import moment from "moment";
import styled from "styled-components";

import Reaction from "./Reaction.jsx";

const Container = styled.div`
  .entry-reaction-list {
    margin: 2rem;
    padding: 0;
    list-style: none;
    li {
      margin: 0 0 1rem;
      padding: 0;
      display: flex;
      align-items: center;
      .reaction {
        flex: 0 0 auto;
        margin-right: 2rem;
      }
      .entry {
        flex: 1 1 100%;
        border: 1px solid #ddd;
        border-radius: 7px;
        padding: 1rem;
        footer {
          background: #f7f7f7;
          border-radius: 0 0 7px 7px;
          margin: 0 -1rem -1rem -1rem;
          padding: 0.5rem 1rem;
          .date {
            margin: 0;
            color: #999;
            font-size: 0.8em;
            a {
              color: inherit;
              text-decoration: none;
              &:hover {
                color: #333;
              }
            }
          }
        }
      }
    }
  }
`;

export default class EntryReactionList extends Component {
  _getEntryUrl = entry => {
    return `https://facebook.com/${entry._id}`;
  };
  render() {
    const { reactions } = this.props;
    return (
      <Container className="entry-reaction-container">
        {reactions.length ? (
          <ul className="entry-reaction-list">
            {reactions.map(reaction => (
              <li key={reaction._id}>
                <div className="reaction">
                  <Reaction reaction={reaction.type} size="large" />
                </div>
                <div className="entry">
                  <div className="entry-message">
                    <p>{reaction.entry.message}</p>
                    <footer>
                      <p className="date">
                        <a
                          href={this._getEntryUrl(reaction.entry)}
                          target="_blank"
                          rel="external"
                        >
                          {moment(reaction.entry.createdTime).format("LLL")}
                        </a>
                      </p>
                    </footer>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </Container>
    );
  }
}
