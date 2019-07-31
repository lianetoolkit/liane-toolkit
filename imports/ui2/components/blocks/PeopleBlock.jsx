import React, { Component } from "react";
import { FormattedMessage } from "react-intl";
import styled from "styled-components";

import PersonContactIcons from "../PersonContactIcons.jsx";
import Button from "../Button.jsx";
import Loading from "../Loading.jsx";

const Container = styled.section`
  display: flex;
  flex-direction: column;
  height: 300px;
  overflow: hidden;
  header {
    border-radius: 7px 7px 0 0;
    flex: 0 0 auto;
    background: #fc0;
    padding: 0.75rem 1rem;
    margin-top: -1px;
    margin-left: -1px;
    margin-right: -1px;
    h3 {
      font-size: 1em;
      color: #fff;
      margin: 0;
    }
  }
  footer {
    flex: 0 0 auto;
    font-size: 0.8em;
    margin-bottom: -1px;
    margin-left: -1px;
    margin-right: -1px;
    a.button {
      border-top-left-radius: 0 !important;
      border-top-right-radius: 0 !important;
    }
    a.button:first-child {
      border-bottom-left-radius: 7px;
    }
    a.button:last-child {
      border-bottom-right-radius: 7px;
    }
  }
  .people-table {
    flex: 1 1 100%;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
  }
  table {
    width: 100%;
    font-size: 0.8em;
    margin: 0;
    padding: 0;
    border-spacing: 0;
    td {
      white-space: nowrap;
      padding: 0.5rem 1rem;
      width: 1px;
      border-bottom: 1px solid #eee;
      &:first-child {
        white-space: normal;
        width: auto;
      }
      a {
        text-decoration: none;
      }
    }
  }
  .not-found {
    margin: 0;
    flex: 1 1 100%;
    color: #999;
    font-style: italic;
    font-size: 0.9em;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    span {
      margin: 0 2rem;
    }
  }
`;

export default class PeopleBlock extends Component {
  constructor(props) {
    super(props);
    this.state = { people: [], loading: false };
  }
  componentDidMount() {
    this.fetchPeople();
  }
  fetchPeople = () => {
    const { query } = this.props;
    this.setState({
      loading: true
    });
    Meteor.call("people.search", query, (err, data) => {
      this.setState({
        loading: false
      });
      if (!err) {
        this.setState({
          people: data
        });
      }
    });
  };
  render() {
    const { title, color } = this.props;
    const { loading, people } = this.state;
    return (
      <Container>
        <header
          style={{
            backgroundColor: color || "#fc0"
          }}
        >
          <h3>{title}</h3>
        </header>
        <div className="people-table">
          {loading ? <Loading /> : null}
          {!loading && people.length ? (
            <table>
              <tbody>
                {people.map(person => (
                  <tr key={person._id}>
                    <td>
                      <a
                        href={FlowRouter.path("App.people.detail", {
                          personId: person._id
                        })}
                      >
                        {person.name}
                      </a>
                    </td>
                    <td>
                      <PersonContactIcons person={person} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
          {!loading && !people.length ? (
            <p className="not-found">
              <span>
                <FormattedMessage
                  id="app.dashboard.people.not_found"
                  defaultMessage="This category is still empty"
                />
              </span>
            </p>
          ) : null}
        </div>
        {/* {!loading ? (
          <footer>
            <Button.Group>
              {people.length ? (
                <Button>
                  <FormattedMessage
                    id="app.dashboard.people.export"
                    defaultMessage="Export"
                  />{" "}
                  {title}
                </Button>
              ) : null}
              <Button>
                <FormattedMessage
                  id="app.dashboard.people.add_from_db"
                  defaultMessage="Add from directory"
                />
              </Button>
            </Button.Group>
          </footer>
        ) : null} */}
      </Container>
    );
  }
}
