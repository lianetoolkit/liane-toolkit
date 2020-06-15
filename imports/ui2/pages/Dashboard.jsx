import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
  FormattedHTMLMessage,
} from "react-intl";
import styled from "styled-components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { alertStore } from "../containers/Alerts.jsx";

import Page from "../components/Page.jsx";
import Dashboard from "../components/Dashboard.jsx";
import Button from "../components/Button.jsx";
import Loading from "../components/Loading.jsx";
import PeopleBlock from "../components/blocks/PeopleBlock.jsx";

const messages = defineMessages({
  donors: {
    id: "app.dashboard.donors.title",
    defaultMessage: "Donors",
  },
  volunteers: {
    id: "app.dashboard.volunteers.title",
    defaultMessage: "Volunteers",
  },
});

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

class DashboardPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      counts: {},
      ready: false,
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
          ready: !this.isFirstRun(),
        });
      }
    });
  }
  isFirstRun = (props) => {
    const { entriesJob, runningEntriesJobs } = props || this.props;
    return (
      entriesJob &&
      entriesJob.repeated < 2 &&
      (entriesJob.status == "running" || runningEntriesJobs.length)
    );
  };
  render() {
    const { intl, campaignId, entriesJob } = this.props;
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
            <h2>
              <FormattedMessage
                id="app.first_run.title"
                defaultMessage="Running first data fetch"
              />
            </h2>
            <Loading />
            <p>
              <FormattedMessage
                id="app.first_run.message"
                defaultMessage="Soon you will be able to continue using the platform."
              />
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
              title={intl.formatMessage(messages.volunteers)}
              color="#ffa500"
              query={{
                campaignId,
                query: {
                  "campaignMeta.volunteer": true,
                },
                options: {},
              }}
            />
          </Dashboard.Box>
          <Dashboard.Box grow="2" attached>
            <PeopleBlock
              title={intl.formatMessage(messages.donors)}
              color="#46dd46"
              query={{
                campaignId,
                query: {
                  "campaignMeta.donor": true,
                },
                options: {},
              }}
            />
          </Dashboard.Box>
          <Dashboard.Box primary={true}>
            <p>
              <FormattedHTMLMessage
                id="app.dashboard.crm.info"
                defaultMessage="Your database has a total of <strong>{people} people</strong>, that contributed with <strong>{comments} comments</strong> and <strong>{reactions} reactions</strong> to your posts."
                values={{
                  people: counts.people,
                  comments: counts.comments,
                  reactions: counts.likes,
                }}
              />
            </p>
            <div className="links">
              <p>
                <Button href={FlowRouter.path("App.people")}>
                  <FormattedMessage
                    id="app.dashboard.crm.directory"
                    defaultMessage="People directory"
                  />
                </Button>
              </p>
              <p>
                <a href={FlowRouter.path("App.comments")}>
                  <FormattedMessage
                    id="app.dashboard.crm.comments"
                    defaultMessage="Manage comments"
                  />
                </a>
              </p>
            </div>
          </Dashboard.Box>
        </Dashboard.Row>
        <Dashboard.Row>
          <Dashboard.Box minimal>
            <header>
              <FontAwesomeIcon icon="map-marked" />
              <h3>
                <FormattedMessage
                  id="app.dashboard.territory.title"
                  defaultMessage="Territory"
                />
              </h3>
            </header>
            <section>
              <p>
                <FormattedMessage
                  id="app.dashboard.territory.intro"
                  defaultMessage="Use a map to better strategize your territory actions"
                />
              </p>
            </section>
            <footer>
              <Button href={FlowRouter.path("App.map")}>
                <FormattedMessage
                  id="app.dashboard.territory.button"
                  defaultMessage="Create a map"
                />
              </Button>
            </footer>
          </Dashboard.Box>
          <Dashboard.Box minimal>
            <header>
              <FontAwesomeIcon icon="marker" />
              <h3>
                <FormattedMessage
                  id="app.dashboard.faq.title"
                  defaultMessage="Frequently Asked Questions"
                />
              </h3>
            </header>
            <section>
              <p>
                <FormattedMessage
                  id="app.dashboard.faq.intro"
                  defaultMessage="Optimize your campaign communications setting up answers to frequently asked questions."
                />
              </p>
            </section>
            <footer>
              <Button href={FlowRouter.path("App.faq")}>
                <FormattedMessage
                  id="app.dashboard.faq.button"
                  defaultMessage="Write Answers"
                />
              </Button>
            </footer>
          </Dashboard.Box>
          <Dashboard.Box minimal>
            <header>
              <FontAwesomeIcon icon="align-left" />
              <h3>
                <FormattedMessage
                  id="app.dashboard.form.title"
                  defaultMessage="People form"
                />
              </h3>
            </header>
            <section>
              <p>
                <FormattedMessage
                  id="app.dashboard.form.intro"
                  defaultMessage="Invite people to be part of your campaign with a customizable form!"
                />
              </p>
            </section>
            <footer>
              <Button href={FlowRouter.path("App.formSettings")}>
                <FormattedMessage
                  id="app.dashboard.form.button"
                  defaultMessage="Setup your form"
                />
              </Button>
            </footer>
          </Dashboard.Box>
        </Dashboard.Row>
      </Dashboard>
    );
  }
}

DashboardPage.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(DashboardPage);
