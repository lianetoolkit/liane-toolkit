import React, { Component } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Page from "../components/Page.jsx";
import Loading from "../components/Loading.jsx";
import Table from "../components/Table.jsx";

const Container = styled.div`
  max-width: 500px;
  margin: 4rem auto;
  background: #fff;
  border-radius: 7px;
  box-shadow: 0 0 2rem rgba(0, 0, 0, 0.1);
  padding: 2rem;
  h1 {
    margin: 0 0 2rem;
  }
  p.not-found {
    font-size: 1.2em;
    margin: 0 0 2rem;
    padding: 0 0 2rem;
    border-bottom: 1px solid #ddd;
  }
  .table {
    margin: 0 0 2rem;
  }
  p.not-found {
    font-size: 1.2em;
    font-style: italic;
  }
  p.support-text {
    color: #999;
    font-size: 0.8em;
    margin: 0;
  }
`;

export default class TransparencyPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      accounts: []
    };
  }
  componentDidMount() {
    this.setState({
      loading: true
    });
    Meteor.call("facebook.accounts.public", {}, (err, res) => {
      if (err) {
        this.setState({
          loading: false
        });
        alertStore.add(err);
      } else {
        this.setState({
          loading: false,
          accounts: res
        });
      }
    });
  }
  render() {
    const { loading, accounts } = this.state;
    if (loading) return <Loading full />;
    return (
      <Page.Content full>
        <Container>
          <h1>Transparency</h1>
          {accounts.length ? (
            <>
              <p>List of Facebook pages registered in our platform:</p>
              <Table>
                <tbody>
                  {accounts.map(account => (
                    <tr key={account.facebookId}>
                      <td className="fill">{account.name}</td>
                      <td>
                        <a
                          href={`https://facebook.com/${account.facebookId}`}
                          target="_blank"
                          rel="external"
                        >
                          <FontAwesomeIcon icon={["fab", "facebook-square"]} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          ) : (
            <p className="not-found">
              No Facebook pages were found in our platform.
            </p>
          )}
          <p className="support-text">
            Need help or would like to report a problem? Write to{" "}
            <a href="mailto:info@liane.voto">info@liane.voto</a> and talk to
            our team.
          </p>
        </Container>
      </Page.Content>
    );
  }
}
