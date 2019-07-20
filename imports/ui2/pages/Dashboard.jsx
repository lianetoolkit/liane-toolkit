import React, { Component } from "react";
import styled from "styled-components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { alertStore } from "../containers/Alerts.jsx";

import Page from "../components/Page.jsx";
import Dashboard from "../components/Dashboard.jsx";
import Button from "../components/Button.jsx";
import Loading from "../components/Loading.jsx";
import PeopleBlock from "../components/blocks/PeopleBlock.jsx";

const FirstRunContainer = styled.div`
  flex: 1 1 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  .first-run-content {
    max-width: 500px;
    background: #fff;
    border-radius: 7px;
    border: 1px solid #ccc;
    box-shadow: 0 0 2rem rgba(0, 0, 0, 0.25);
    padding: 2rem;
    h2 {
      font-family: "Open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
      margin: 0;
    }
    p {
      font-size: 0.8em;
      font-style: italic;
      color: #999;
    }
  }
`;

export default class DashboardPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      counts: {},
      ready: false
    };
  }
  componentDidMount() {
    const { campaignId } = this.props;
    if (campaignId) this.fetchCounts();
  }
  componentDidUpdate(prevProps, prevState) {
    const { entriesJob, runningEntriesJobs } = this.state;
    if (!this.isFirstRun() && this.isFirstRun(prevProps)) {
      this.fetchCounts();
      alertStore.add("Coleta concluída", "success");
    }
  }
  fetchCounts() {
    const { campaignId } = this.props;
    Meteor.call("campaigns.counts", { campaignId }, (err, res) => {
      if (!err) {
        this.setState({
          counts: res,
          ready: !this.isFirstRun()
        });
      }
    });
  }
  isFirstRun = props => {
    const { entriesJob, runningEntriesJobs } = props || this.props;
    return (
      entriesJob &&
      entriesJob.repeated < 2 &&
      (entriesJob.status == "running" || runningEntriesJobs.length)
    );
  };
  render() {
    const { campaignId, entriesJob } = this.props;
    const { ready, counts } = this.state;
    if (
      !campaignId ||
      !entriesJob ||
      (entriesJob.repeated == 0 && entriesJob.status !== "running")
    )
      return <Loading full />;
    if (this.isFirstRun()) {
      return (
        <FirstRunContainer>
          <div className="first-run-content">
            <h2>Executando primeira coleta de dados</h2>
            <Loading />
            <p>
              Aguarde esta coleta terminar para continuar utilizando a
              plataforma.
            </p>
          </div>
        </FirstRunContainer>
      );
    }
    if (!ready) return <Loading full />;
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
              <strong>{counts.people} pessoas</strong>, que realizaram <strong>{counts.comments} comentários</strong> e{" "}
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
          <Dashboard.Box minimal>
            <header>
              <FontAwesomeIcon icon={["fab", "facebook-messenger"]} />
              <h3>Chatbot</h3>
            </header>
            <section>
              <p>
                Configure seu chatbot para espalhar sua mensagem e conseguir
                apoiadores.
              </p>
            </section>
            <footer>
              <Button href={FlowRouter.path("App.chatbot")}>
                Configurar Chatbot
              </Button>
            </footer>
          </Dashboard.Box>
          <Dashboard.Box minimal>
            <header>
              <FontAwesomeIcon icon="map-marked" />
              <h3>Território</h3>
            </header>
            <section>
              <p>Utilize o mapa para sua estratégia de território.</p>
            </section>
            <footer>
              <Button href={FlowRouter.path("App.map")}>Criar mapa</Button>
            </footer>
          </Dashboard.Box>
          <Dashboard.Box minimal>
            <header>
              <FontAwesomeIcon icon="marker" />
              <h3>Perguntas frequentes</h3>
            </header>
            <section>
              <p>
                Configure respostas a perguntas frequentes para facilitar a
                comunicação da sua campanha.
              </p>
            </section>
            <footer>
              <Button href={FlowRouter.path("App.faq")}>
                Escrever respostas
              </Button>
            </footer>
          </Dashboard.Box>
        </Dashboard.Row>
      </Dashboard>
    );
  }
}
