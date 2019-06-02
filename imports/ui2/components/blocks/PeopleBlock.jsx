import React, { Component } from "react";
import styled from "styled-components";

import PersonContactIcons from "../PersonContactIcons.jsx";
import Button from "../Button.jsx";

const Container = styled.section`
  display: flex;
  flex-direction: column;
  height: 300px;
  overflow: hidden;
  header {
    border-radius: 7px 7px 0 0;
    flex: 0 0 auto;
    background: #fc0;
    padding: 0.5rem 1rem;
    margin-top: -1px;
    margin-left: -1px;
    margin-right: -1px;
    h3 {
      font-size: 0.8em;
      color: #fff;
      margin: 0;
    }
  }
  footer {
    flex: 0 0 auto;
    font-size: 0.8em;
    a.button:first-child {
      border-radius: 0 0 0 7px;
    }
    a.button:last-child {
      border-radius: 0 0 7px 0;
    }
  }
  .people-table {
    flex: 1 1 100%;
    overflow-y: auto;
    overflow-x: hidden;
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
    }
  }
`;

export default class PeopleBlock extends Component {
  constructor(props) {
    super(props);
    this.state = { people: [] };
  }
  componentDidMount() {
    this.fetchPeople();
  }
  fetchPeople = () => {
    const { query } = this.props;
    Meteor.call("people.search", query, (err, data) => {
      if (!err) {
        this.setState({
          people: data
        });
      }
    });
  };
  render() {
    const { title, color } = this.props;
    const { people } = this.state;
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
          {people.length ? (
            <table>
              <tbody>
                {people.map(person => (
                  <tr key={person._id}>
                    <td>{person.name}</td>
                    <td>
                      <PersonContactIcons person={person} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>
        <footer>
          <Button.Group>
            <Button>Exportar {title}</Button>
            <Button>Marcar novos</Button>
          </Button.Group>
        </footer>
      </Container>
    );
  }
}
