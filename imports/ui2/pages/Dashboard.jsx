import React, { Component } from "react";

import Page from "../components/Page.jsx";
import Dashboard from "../components/Dashboard.jsx";
import Button from "../components/Button.jsx";
import PeopleBlock from "../components/blocks/PeopleBlock.jsx";

export default class DashboardPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      counts: {}
    };
  }
  componentDidMount() {
    this.fetchCounts();
  }
  fetchCounts() {
    const { campaignId } = this.props;
    Meteor.call("campaigns.counts", { campaignId }, (err, res) => {
      if (!err) {
        this.setState({
          counts: res
        });
      }
    });
  }
  render() {
    const { counts } = this.state;
    const { campaignId } = this.props;
    return (
      <Dashboard>
        <Dashboard.Row>
          <Dashboard.Box grow="2" attached>
            <PeopleBlock
              title="Doadores"
              color="#46dd46"
              query={{
                campaignId,
                query: {
                  "campaignMeta.donor": true
                },
                options: {}
              }}
            />
          </Dashboard.Box>
          <Dashboard.Box grow="2" attached>
            <PeopleBlock
              title="Voluntários"
              color="#ffa500"
              query={{
                campaignId,
                query: {
                  "campaignMeta.volunteer": true
                },
                options: {}
              }}
            />
          </Dashboard.Box>
          <Dashboard.Box primary={true}>
            <p>
              Sua base possui um total de{" "}
              <strong>{counts.people} pessoas</strong>, que realizaram um total
              de <strong>{counts.comments} comentários</strong> e{" "}
              <strong>{counts.likes} reações</strong> a publicações.
            </p>
            <div className="links">
              <p>
                <Button href={FlowRouter.path("App.people")}>
                  Diretório de pessoas
                </Button>
              </p>
              <p>
                <a href={FlowRouter.path("App.comments")}>Gerir comentários</a>
              </p>
            </div>
          </Dashboard.Box>
        </Dashboard.Row>
        <Dashboard.Row>
          <Dashboard.Box grow="2">
            <Dashboard.Title>Teste</Dashboard.Title>
            <p>Teste</p>
          </Dashboard.Box>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
        </Dashboard.Row>
        <Dashboard.Row>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
        </Dashboard.Row>
        <Dashboard.Row>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
        </Dashboard.Row>
        <Dashboard.Row>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
        </Dashboard.Row>
        <Dashboard.Row>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
        </Dashboard.Row>
        <Dashboard.Row>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
        </Dashboard.Row>
        <Dashboard.Row>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
          <Dashboard.Box>
            <p>Teste</p>
          </Dashboard.Box>
        </Dashboard.Row>
      </Dashboard>
    );
  }
}
