import React, { Component } from "react";
import styled from "styled-components";
import moment from "moment";

import { alertStore } from "../containers/Alerts.jsx";

import Loading from "./Loading.jsx";
import Table from "./Table.jsx";
import Button from "./Button.jsx";

const Container = styled.div`
  margin: -2rem;
  overflow: hidden;
  border-radius: 0 0 7px 7px;
  position: relative;
  .tip {
    font-size: 0.8em;
    color: #666;
    margin: 1rem 2rem;
  }
  .not-found {
    margin: 2rem;
    text-align: center;
    font-size: 1.2em;
    color: #999;
    font-style: italic;
  }
  .button {
    font-size: 0.8em;
    text-align: center;
  }
`;

export default class PeopleLists extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      counts: {}
    };
  }
  componentDidMount() {
    this.fetchCounts();
  }
  fetchCounts = () => {
    const { lists } = this.props;
    lists.forEach(list => {
      this.setState({ loading: true });
      Meteor.call(
        "peopleLists.peopleCount",
        { listId: list._id },
        (err, res) => {
          this.setState({ loading: false });
          if (!err) {
            this.setState({
              counts: {
                ...this.state.counts,
                [list._id]: res
              }
            });
          }
        }
      );
    });
  };
  _handleRemoveClick = listId => ev => {
    ev.preventDefault();
    if (
      confirm(
        "Tem certeza que deseja remover todas as pessoas importadas dessa lista?"
      )
    ) {
      this.setState({ loading: true });
      Meteor.call("peopleLists.remove", { listId }, (err, res) => {
        this.setState({ loading: false });
        if (err) {
          alertStore.add(err);
        } else {
          window.location.reload();
        }
      });
    }
  };
  render() {
    const { lists } = this.props;
    const { loading, counts } = this.state;
    return (
      <Container>
        {loading ? <Loading full /> : null}
        {lists && lists.length ? (
          <>
            <Table compact>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Data</th>
                  <th>Pessoas</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {lists.map(list => (
                  <tr key={list._id}>
                    <td>{list.name}</td>
                    <td>{moment(list.createdAt).format("L")}</td>
                    <td>{counts[list._id]} pessoas importadas</td>
                    <td>
                      <a
                        href="javascript:void(0);"
                        className="button delete"
                        onClick={this._handleRemoveClick(list._id)}
                      >
                        Remover
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <p className="tip">
              Ao remover uma lista você remove também suas pessoas importadas.
            </p>
          </>
        ) : (
          <p className="not-found">Nenhuma importação encontrada</p>
        )}
      </Container>
    );
  }
}
