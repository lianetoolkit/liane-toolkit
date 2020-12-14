import React from "react";
import styled from "styled-components";
import Page from "/imports/ui2/components/Page.jsx";
import Loading from "/imports/ui2/components/Loading.jsx";
import Button from "/imports/ui2/components/Button.jsx";
import moment from "moment";
import axios from "axios";
import { ClientStorage } from "meteor/ostrio:cstorage";
import { messages as reactionsLabels } from "/locales/features/facebookReactions";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
  FormattedHTMLMessage,
} from "react-intl";
import { get } from "lodash";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FirstRun from "../components/FirstRun.jsx";

const messages = defineMessages({
  peopleChartLabel: {
    id: "app.dashboard.interactions.new_people.chart_label",
    defaultMessage: "Newcomers",
  },
});

const Container = styled.section`
  width: 100%;
  background: #306;
  color: #fff;
  overflow: auto;
  .number {
    font-feature-settings: "tnum" on, "onum" on;
    font-weight: 500;
    font-size: 2.8em;
  }
  .dashboard-header {
    max-width: 1000px;
    margin: 0 auto 4rem;
    padding: 4rem 2rem;
    display: flex;
    h1 {
      margin: 0 0 2rem;
    }
    .button {
      background: #fff;
      margin: 0;
      display: inline-block;
      border: 0;
      flex: 0 0 auto;
      &:hover {
        background: #f8f3ff;
        color: #306;
      }
    }
    .intro {
      width: 20%;
      flex: 0 0 auto;
      margin: 0 5rem 0 0;
      font-size: 0.8em;
      h1 {
        font-size: 1.4em;
      }
    }
    .data {
      flex: 1 1 100%;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      .main-data {
        flex: 1 1 100%;
        display: flex;
        justify-content: flex-start;
        align-items: flex-end;
        line-height: 1.2;
        font-weight: 500;
        margin: 0 0 2rem;
        padding: 0 0 3rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        .number {
          font-size: 4em;
          margin-right: 2rem;
          flex: 0 0 auto;
        }
        .text {
          flex: 0 0 auto;
          font-size: 1.6em;
          letter-spacing: -0.05rem;
          margin-right: 2rem;
        }
        .button {
          flex: 0 0 auto;
        }
      }
      .secondary-data {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        .number,
        .text {
          margin: 0 0 1rem;
        }
      }
    }
  }
  .dashboard-sections {
    margin: 0 auto 4rem;
    max-width: 1000px;
    border-radius: 7px;
    background: #fff;
    color: #333;
    box-sizing: border-box;
    overflow: hidden;
    .funnel {
      display: flex;
      align-items: stretch;
      justify-content: space-around;
      width: 100%;
      .funnel-chart {
        box-sizing: border-box;
        flex: 1;
        background: #eee;
        position: relative;
        margin: 2rem;
        .funnel-chart-content {
          position: absolute;
          left: 0;
          top: 0;
          right: 0;
          bottom: 0;
          ul {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            list-style: none;
            display: flex;
            flex-direction: column;
            align-items: stretch;
            justify-content: space-around;
            font-size: 0.9em;
            li {
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #fff;
              font-weight: 500;
              position: relative;
            }
          }
        }
        &:before {
          content: "";
          display: block;
          padding-bottom: 89.625%;
        }
        &:after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          background-image: url("/images/funnel-overlay.png");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          pointer-events: none;
        }
      }
      .funnel-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: space-around;
        margin: 2rem;
        > * {
          flex: 1;
          margin: 0;
        }
        p {
          display: flex;
          align-items: center;
          &:before {
            display: block;
            content: "";
            height: 1px;
            width: 60%;
            background: rgb(51, 0, 102, 0.1);
            margin-left: -14rem;
            margin-right: 2rem;
            position: relative;
            z-index: 10;
            pointer-events: none;
          }
        }
        .highlight {
          font-weight: 600;
          font-size: 1.2em;
        }
      }
    }
    .dashboard-section {
      padding: 2rem;
      border-bottom: 1px solid #e0e0e0;
      transition: opacity 0.2s linear;
      &.loading {
        opacity: 0.5;
      }
      &:last-child {
        border-bottom: 0;
      }
      h2 {
        text-align: center;
        font-weight: 500;
        letter-spacing: -0.02rem;
        font-size: 1.8em;
        margin: 2rem 0;
      }
      .info {
        font-size: 1.2em;
        text-align: center;
        color: #777;
        margin: 4rem 0;
      }
      &.impulsa-section {
        h2 span {
          display: flex;
          justify-content: center;
          img {
            width: auto;
            height: 35px;
            margin-left: 1rem;
          }
        }
      }
    }
  }
`;

const Achievements = styled.ul`
  list-style: none;
  display: flex;
  justify-content: center;
  margin: 0;
  padding: 0;
  li {
    flex: 1 1 auto;
    margin: 0 2rem;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    cursor: pointer;
    align-items: flex-start;
    &:hover {
      box-shadow: 0 0 2px rgba(0, 0, 0, 0.25), 0 2px 4px rgba(0, 0, 0, 0.15);
      border-radius: 7px;
    }
    svg {
      font-size: 1.8em;
      margin: 0 0 1rem;
      ${"" /* background: #ede7f6;
      padding: 0.5rem;
      border-radius: 7px; */}
      -webkit-filter: drop-shadow(2px 2px 0 #ede7f6);
      filter: drop-shadow(2px 2px 0 #ede7f6);
    }
    .number {
      font-size: 4em;
      margin: 0 0 0.5rem;
    }
    .label {
      margin: 0 0 1.5rem;
    }
    .button {
      margin: 0;
      background: #306;
      color: #fff;
      border: 0;
      flex: 0 0 auto;
      display: inline-block;
      &:hover,
      &:active,
      &:focus {
      }
    }
  }
`;

const ChartNav = styled.nav`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 0 1rem;
  a {
    font-weight: 500;
    color: #306;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 500px;
    margin: 0 0.5rem;
    &.active,
    &:hover {
      background: rgba(51, 0, 102, 0.15);
    }
  }
`;

const InteractionsContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 0 2rem;
  > div {
    border: 1px solid #ddd;
    border-radius: 7px;
    margin: 1rem;
    &.fill {
      flex: 1 1 100%;
    }
    h3 {
      padding: 1rem 2rem;
      margin: 0;
      border-bottom: 1px solid #ddd;
    }
  }
  .chart {
    width: 100%;
    box-sizing: border-box;
    padding: 2rem 2rem 2rem 0;
    display: flex;
    align-items: center;
    .recharts-responsive-container {
      flex: 1 1 100%;
    }
    nav {
      flex: 0 0 auto;
      display: flex;
      flex-direction: column;
      margin-left: 2rem;
      a {
        display: flex;
        align-items: center;
        margin: 0.7rem 0;
        font-size: 25px;
        &.disabled {
          opacity: 0.5;
        }
        .color-icon {
          width: 10px;
          height: 10px;
          border-radius: 7px;
          display: block;
          margin-right: 1rem;
        }
        img {
          width: 25px;
          height: auto;
        }
      }
    }
  }
`;

const TopPeople = styled.div`
  flex: 1 0 auto;
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
    font-size: 0.9em;
    li {
      margin: 0;
      padding: 0;
      a {
        text-decoration: none;
        display: flex;
        justify-content: space-between;
        padding: 0.7rem 2rem;
        border-bottom: 1px solid #ddd;
        color: #333;
        &:last-child {
          border-bottom: 0;
          border-radius: 0 0 7px 7px;
        }
        &:hover {
          background: #f7f7f7;
        }
      }
    }
  }
`;

const SupportMaterials = styled.ul`
  margin: 0 3rem 2rem;
  padding: 0;
  list-style: none;
  border: 1px solid #ddd;
  border-radius: 7px;
  font-size: 0.8em;
  li {
    margin: 0;
    padding: 0.5rem 0.5rem 0.5rem 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #ddd;
    h3 {
      font-size: 1em;
      margin: 0;
      flex: 1 1 100%;
    }
    p {
      margin: 0 1.4rem 0 0;
      flex: 0 0 auto;
      font-size: 0.9em;
      color: #666;
    }
    a.button {
      margin: 0;
    }
    &:last-child {
      border-bottom: 0;
    }
  }
`;

const createPromise = function (handler) {
  var resolve, reject;
  var promise = new Promise(function (_resolve, _reject) {
    resolve = _resolve;
    reject = _reject;
    if (handler) handler(resolve, reject);
  });
  promise.resolve = resolve;
  promise.reject = reject;
  return promise;
};

class DashboardDemoPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      summaryData: null,
      achievements: null,
      funnelData: null,
      chartsData: null,
      disabledChartItems: {},
      loadingChart: false,
      impulsaTracks: [],
      peopleHistory: {},
    };
  }
  isFirstRun = (props) => {
    const { entriesJob, runningEntriesJobs } = props || this.props;
    return (
      entriesJob &&
      entriesJob.repeated < 2 &&
      (entriesJob.status == "running" || runningEntriesJobs.length)
    );
  };
  _getInteractionChartData = (data) => {
    let response = [];
    for (const day in data) {
      response.push({
        day,
        comments: get(data[day], "comments") || 0,
        like: get(data[day], "reactions.LIKE") || 0,
        love: get(data[day], "reactions.LOVE") || 0,
        care: get(data[day], "reactions.CARE") || 0,
        wow: get(data[day], "reactions.WOW") || 0,
        haha: get(data[day], "reactions.HAHA") || 0,
        sad: get(data[day], "reactions.SAD") || 0,
        angry: get(data[day], "reactions.ANGRY") || 0,
      });
    }
    return response;
  };
  _getPeopleHistoryChartData = (data) => {
    let response = [];
    for (const day in data) {
      response.push({
        day,
        people_count: data[day],
      });
    }
    return response;
  };
  componentDidMount() {
    // Call methods here
    const { campaign } = this.props;
    const promises = [];
    //  Summary Data
    const summaryPromise = createPromise();
    promises.push(summaryPromise);
    Meteor.call(
      "dashboard.summary",
      { campaignId: campaign._id },
      (err, data) => {
        if (err) {
          console.log("dashboard.summary error ", err);
        } else {
          this.setState({ summaryData: data });
        }
        summaryPromise.resolve();
      }
    );

    // Achievements
    const achievementsPromise = createPromise();
    promises.push(achievementsPromise);
    Meteor.call(
      "dashboard.achievements",
      { campaignId: campaign._id },
      (err, data) => {
        if (err) {
          console.log("dashboard.achievements error ", err);
        } else {
          this.setState({ achievements: data });
        }
        achievementsPromise.resolve();
      }
    );

    // funnel data
    const funnelPromise = createPromise();
    promises.push(funnelPromise);
    Meteor.call(
      "dashboard.funnelData",
      { campaignId: campaign._id },
      (err, data) => {
        if (err) {
          console.log("dashboard.funnel error ", err);
        } else {
          this.setState({ funnelData: data });
        }
        funnelPromise.resolve();
      }
    );

    this._fetchImpulsa();

    Promise.all(promises).then(() => {
      this.setState({ loading: false });
    });

    this._setChart("7days");
  }
  getChartItemBgColor(index, total) {
    return `rgba(51,0,102, ${(10 + (90 / total) * index) / 100})`;
  }
  _handleChartFilterClick = (period) => (ev) => {
    ev.preventDefault();
    this._setChart(period);
  };
  _fetchImpulsa = () => {
    const lang = (ClientStorage.get("language") || "pt-BR").split("-")[0];
    const impulsaAvailableLangs = {
      pt: "pt",
      es: "es",
    };
    axios
      .get(
        `https://www.impulsa.voto/wp-json/wp/v2/tracks?lang=${
          impulsaAvailableLangs[lang] || "pt"
        }`
      )
      .then((res) => {
        this.setState({
          impulsaTracks: res.data,
        });
      });
  };
  _handleChartLegendClick = (id) => (ev) => {
    ev.preventDefault();
    this.setState({
      disabledChartItems: {
        ...this.state.disabledChartItems,
        [id]: !this.state.disabledChartItems[id],
      },
    });
  };
  _setChart = (period) => {
    const { campaign } = this.props;
    let startDate;
    switch (period) {
      case "month":
        startDate = moment().startOf("month");
        break;
      case "30days":
        startDate = moment().subtract(30, "days");
        break;
      case "90days":
        startDate = moment().subtract(90, "days");
        break;
      case "7days":
      default:
        startDate = moment().subtract(7, "days");
        break;
    }
    this.setState({
      loadingChart: true,
    });
    Meteor.call(
      "dashboard.chartsData",
      {
        campaignId: campaign._id,
        startDate: startDate.format(),
      },
      (err, data) => {
        if (err) {
          console.log("dashboard.chartsData error ", err);
          this.setState({
            loadingChart: false,
          });
        } else {
          if (!data) {
            this.setState({
              chartNotReady: true,
              loadingChart: false,
            });
          } else {
            this.setState({
              chartPeriod: period,
              ...data,
              chartsData: data,
              loadingChart: false,
            });
          }
        }
      }
    );
  };
  getPercentage = (amount, total) => {
    return Math.round((amount / total) * 100) + "%";
  };
  _handleAchievementClick = (path, queryParams = {}) => (ev) => {
    ev.preventDefault();
    FlowRouter.go(path, {}, queryParams);
  };
  render() {
    const { intl, user, campaign } = this.props;
    const {
      loading,
      summaryData,
      achievements,
      funnelData,
      chartPeriod,
      chartsData,
      chartNotReady,
      peopleHistory,
      topReactioners,
      topCommenters,
      impulsaTracks,
      disabledChartItems,
      loadingChart,
    } = this.state;
    if (this.isFirstRun()) {
      return <FirstRun />;
    }
    const chartConfig = [
      {
        id: "comments",
        color: "#1ac8e7",
        icon: <FontAwesomeIcon icon="comment" />,
      },
      {
        id: "like",
        color: "#175DEB",
        icon: <img src="/images/reactions/like.png" />,
      },
      {
        id: "love",
        color: "#F24A64",
        icon: <img src="/images/reactions/love.png" />,
      },
      {
        id: "care",
        color: "#F9AE3B",
        icon: <img src="/images/reactions/care.png" />,
      },
      {
        id: "haha",
        color: "#EF5A24",
        icon: <img src="/images/reactions/haha.png" />,
      },
      {
        id: "wow",
        color: "#B98AFF",
        icon: <img src="/images/reactions/wow.png" />,
      },
      {
        id: "sad",
        color: "#55C263",
        icon: <img src="/images/reactions/sad.png" />,
      },
      {
        id: "angry",
        color: "#8A2E00",
        icon: <img src="/images/reactions/angry.png" />,
      },
    ];
    if (loading) {
      return <Loading full />;
    }
    return (
      <Container>
        <header className="dashboard-header">
          <div className="intro">
            <h1>
              <FormattedMessage
                id="app.dashboard.greeting"
                defaultMessage="Hello, {name} 🌵"
                values={{ name: user.name }}
              />
            </h1>
            <p>
              <FormattedMessage
                id="app.dashboard.intro_text"
                defaultMessage="Welcome to Liane, we have a lot of work to do to improve participation in this community."
              />
            </p>
          </div>
          <div className="data">
            <div className="total-people main-data">
              <span className="number">
                {summaryData.totalPeople.toLocaleString()}
              </span>
              <span className="text">
                <FormattedMessage
                  id="app.dashboard.summary.total_people_01"
                  defaultMessage="people"
                />
                <br />
                <FormattedMessage
                  id="app.dashboard.summary.total_people_02"
                  defaultMessage="in your database"
                />
              </span>
              <Button href={FlowRouter.path("App.people")}>
                <FormattedMessage
                  id="app.dashboard.summary.total_people_action"
                  defaultMessage="People directory"
                />
              </Button>
            </div>
            <div className="positive-reactions secondary-data">
              <span className="number">
                {summaryData.positiveReactions.toLocaleString()}
              </span>
              <span className="text">
                <FormattedMessage
                  id="app.dashboard.summary.positive_responses"
                  defaultMessage="positive responses"
                />
              </span>
              <Button
                href={FlowRouter.path(
                  "App.people",
                  {},
                  {
                    sort: "likes",
                    order: "desc",
                  }
                )}
              >
                <FormattedMessage
                  id="app.dashboard.summary.positive_responses_action"
                  defaultMessage="View reactions"
                />
              </Button>
            </div>
            <div className="comments secondary-data">
              <span className="number">
                {summaryData.comments.toLocaleString()}
              </span>
              <span className="text">
                <FormattedMessage
                  id="app.dashboard.summary.comments"
                  defaultMessage="comments"
                />
              </span>
              <Button href={FlowRouter.path("App.comments")}>
                <FormattedMessage
                  id="app.dashboard.summary.comments_action"
                  defaultMessage="Manage comments"
                />
              </Button>
            </div>
            <div className="people-pm secondary-data">
              <span className="number">
                {summaryData.peoplePM.toLocaleString()}
              </span>
              <span className="text">
                <FormattedMessage
                  id="app.dashboard.summary.private_replies"
                  defaultMessage="people to send private replies"
                />
              </span>
              <Button
                href={FlowRouter.path(
                  "App.people",
                  {},
                  {
                    private_reply: true,
                  }
                )}
              >
                <FormattedMessage
                  id="app.dashboard.summary.private_replies_action"
                  defaultMessage="Send messages"
                />
              </Button>
            </div>
          </div>
        </header>
        <section className="dashboard-sections">
          <div className="dashboard-section">
            <h2>
              <FormattedMessage
                id="app.dashboard.funnel.title"
                defaultMessage="Conversion Funnel"
              />
            </h2>
            <div className="funnel">
              <div className="funnel-chart">
                <div className="funnel-chart-content">
                  <ul>
                    <li
                      style={{
                        backgroundColor: this.getChartItemBgColor(1, 4),
                      }}
                    >
                      {funnelData.totalPeople.toLocaleString()}
                    </li>
                    <li
                      style={{
                        backgroundColor: this.getChartItemBgColor(2, 4),
                      }}
                    >
                      {this.getPercentage(
                        funnelData.positivePeople,
                        funnelData.totalPeople
                      )}
                    </li>
                    <li
                      style={{
                        backgroundColor: this.getChartItemBgColor(3, 4),
                      }}
                    >
                      {this.getPercentage(
                        funnelData.commentingPeople,
                        funnelData.totalPeople
                      )}
                    </li>
                    <li
                      style={{
                        backgroundColor: this.getChartItemBgColor(4, 4),
                      }}
                    >
                      {this.getPercentage(
                        funnelData.campaignFormPeople,
                        funnelData.totalPeople
                      )}
                    </li>
                    <li
                      style={{
                        backgroundColor: this.getChartItemBgColor(4, 4),
                      }}
                    >
                      &nbsp;
                    </li>
                  </ul>
                </div>
              </div>
              <div className="funnel-info">
                <p>
                  <FormattedMessage
                    id="app.dashboard.funnel.text_01"
                    defaultMessage="People in your database"
                  />
                </p>
                <p>
                  <FormattedMessage
                    id="app.dashboard.funnel.text_02"
                    defaultMessage="With positive reactions"
                  />
                </p>
                <p>
                  <FormattedMessage
                    id="app.dashboard.funnel.text_03"
                    defaultMessage="Are talking to us"
                  />
                </p>
                <p className="highlight">
                  <FormattedMessage
                    id="app.dashboard.funnel.text_04"
                    defaultMessage="Filled out your campaign form"
                  />
                </p>
                <div>&nbsp;</div>
              </div>
            </div>
          </div>
          <div className="dashboard-section">
            <h2>
              <FormattedMessage
                id="app.dashboard.achievements.title"
                defaultMessage="Your achievements"
              />
            </h2>
            <Achievements>
              <li onClick={this._handleAchievementClick("App.formSettings")}>
                <FontAwesomeIcon icon="align-left" />
                <span className="number">
                  {achievements.filledForms.toLocaleString()}
                </span>
                <span className="label">
                  <FormattedMessage
                    id="app.dashboard.filled_forms.text"
                    defaultMessage="completed forms"
                  />
                </span>
                <Button>
                  <FormattedMessage
                    id="app.dashboard.filled_forms.action"
                    defaultMessage="Form settings"
                  />
                </Button>
              </li>
              <li onClick={this._handleAchievementClick("App.map")}>
                <FontAwesomeIcon icon="map-marked" />
                <span className="number">
                  {achievements.geolocated.toLocaleString()}
                </span>
                <span className="label">
                  <FormattedMessage
                    id="app.dashboard.geolocated.text"
                    defaultMessage="mapped people"
                  />
                </span>
                <Button>
                  <FormattedMessage
                    id="app.dashboard.geolocated.action"
                    defaultMessage="View your map"
                  />
                </Button>
              </li>
              <li
                onClick={this._handleAchievementClick("App.comments", {
                  unreplied: true,
                })}
              >
                <FontAwesomeIcon icon="comment" />
                <span className="number">
                  {achievements.commentsReplies.toLocaleString()}
                </span>
                <span className="label">
                  <FormattedMessage
                    id="app.dashboard.comments_replies.text"
                    defaultMessage="comments replies"
                  />
                </span>
                <Button>
                  <FormattedMessage
                    id="app.dashboard.comments_replies.action"
                    defaultMessage="Reply comments"
                  />
                </Button>
              </li>
            </Achievements>
          </div>
          <div className={`dashboard-section ${loadingChart ? "loading" : ""}`}>
            <h2>
              <FormattedMessage
                id="app.dashboard.interactions.title"
                defaultMessage="Interactions evolution"
              />
            </h2>
            {loadingChart && !chartsData ? <Loading /> : null}
            {chartNotReady ? (
              <div className="info">
                <p>
                  <FormattedMessage
                    id="app.dashboard.interactions.not_ready"
                    defaultMessage="We still don't have enough data to display. Get back to this section {time_from_now}."
                    values={{
                      time_from_now: moment(campaign.createdAt)
                        .add(7, "days")
                        .fromNow(),
                    }}
                  />{" "}
                </p>
                <p></p>
              </div>
            ) : null}
            {chartsData ? (
              <>
                <ChartNav>
                  <a
                    href="#"
                    className={chartPeriod == "7days" ? "active" : ""}
                    onClick={this._handleChartFilterClick("7days")}
                  >
                    <FormattedMessage
                      id="app.dashboard.interactions.nav.7days"
                      defaultMessage="7 days"
                    />
                  </a>
                  <a
                    href="#"
                    className={chartPeriod == "month" ? "active" : ""}
                    onClick={this._handleChartFilterClick("month")}
                  >
                    <FormattedMessage
                      id="app.dashboard.interactions.nav.month"
                      defaultMessage="This month"
                    />
                  </a>
                  <a
                    href="#"
                    className={chartPeriod == "30days" ? "active" : ""}
                    onClick={this._handleChartFilterClick("30days")}
                  >
                    <FormattedMessage
                      id="app.dashboard.interactions.nav.30days"
                      defaultMessage="Last 30 days"
                    />
                  </a>
                  <a
                    href="#"
                    className={chartPeriod == "90days" ? "active" : ""}
                    onClick={this._handleChartFilterClick("90days")}
                  >
                    <FormattedMessage
                      id="app.dashboard.interactions.nav.90days"
                      defaultMessage="Last 90 days"
                    />
                  </a>
                </ChartNav>
                <InteractionsContent>
                  <div className="chart">
                    <ResponsiveContainer height={450}>
                      <AreaChart
                        data={this._getInteractionChartData(
                          chartsData.interactionHistory
                        )}
                        margin={{
                          top: 0,
                          right: 0,
                          left: 0,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid stroke="#eee" vertical={false} />
                        <XAxis
                          dataKey="day"
                          type="category"
                          // hide={true}
                          tick={{
                            fontSize: "0.8em",
                            fontFamily: "Roboto Mono",
                          }}
                          tickSize={5}
                          axisLine={false}
                          tickLine={false}
                          tickMargin={10}
                          tickFormatter={(item) => {
                            return moment(item)
                              .format("L")
                              .replace(
                                new RegExp(
                                  "[^.]?" + moment().format("YYYY") + ".?"
                                ),
                                ""
                              );
                          }}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{
                            fontSize: "0.8em",
                            fontFamily: "Roboto Mono",
                          }}
                          tickSize={10}
                          axisLine={false}
                          tickLine={false}
                          tickMargin={10}
                        />
                        <Tooltip
                          contentStyle={{ borderRadius: "7px" }}
                          labelStyle={{ fontWeight: 500 }}
                          labelFormatter={(value) => {
                            return moment(value)
                              .format("L")
                              .replace(
                                new RegExp(
                                  "[^.]?" + moment().format("YYYY") + ".?"
                                ),
                                ""
                              );
                          }}
                          formatter={(value, name, props) => {
                            return [
                              value,
                              intl.formatMessage(reactionsLabels[name]),
                            ];
                          }}
                        />
                        {chartConfig.map((chartItem) => (
                          <Area
                            stackId="interactions"
                            type="monotone"
                            key={chartItem.id}
                            dataKey={chartItem.id}
                            fill={chartItem.color}
                            stroke={chartItem.color}
                            strokeWidth={0}
                            fillOpacity="1"
                          />
                        ))}
                      </AreaChart>
                    </ResponsiveContainer>
                    <nav>
                      {chartConfig.map((chartItem) => (
                        <a
                          href="#"
                          // className={
                          //   disabledChartItems[chartItem.id] ? "disabled" : ""
                          // }
                          onClick={this._handleChartLegendClick(chartItem.id)}
                          style={{ color: chartItem.color }}
                        >
                          <span
                            className="color-icon"
                            style={{ backgroundColor: chartItem.color }}
                          />
                          {chartItem.icon || ""}
                        </a>
                      ))}
                    </nav>
                  </div>
                  <TopPeople>
                    <h3>
                      <FormattedMessage
                        id="app.dashboard.interactions.reactioners"
                        defaultMessage="More reactions"
                      />
                    </h3>
                    <ul>
                      {topReactioners.map((person) => (
                        <li key={person._id}>
                          <a
                            href={FlowRouter.path("App.people.detail", {
                              personId: person._id,
                            })}
                          >
                            <span>{person.name}</span>
                            <span>{person.total.toLocaleString()}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </TopPeople>
                  <TopPeople>
                    <h3>
                      <FormattedMessage
                        id="app.dashboard.interactions.commenters"
                        defaultMessage="More comments"
                      />
                    </h3>
                    <ul>
                      {topCommenters.map((person) => (
                        <li key={person._id}>
                          <a
                            href={FlowRouter.path("App.people.detail", {
                              personId: person._id,
                            })}
                          >
                            <span>{person.name}</span>
                            <span>{person.total.toLocaleString()}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </TopPeople>
                  <div className="fill">
                    <h3>
                      <FormattedMessage
                        id="app.dashboard.interactions.new_people"
                        defaultMessage="New people per day"
                      />
                    </h3>
                    <div className="chart">
                      <ResponsiveContainer height={280}>
                        <AreaChart
                          data={this._getPeopleHistoryChartData(peopleHistory)}
                          margin={{
                            top: 0,
                            right: 0,
                            left: 0,
                            bottom: 0,
                          }}
                        >
                          <CartesianGrid stroke="#eee" vertical={false} />
                          <XAxis
                            dataKey="day"
                            type="category"
                            tick={{
                              fontSize: "0.8em",
                              fontFamily: "Roboto Mono",
                            }}
                            tickSize={5}
                            axisLine={false}
                            tickLine={false}
                            tickMargin={10}
                            tickFormatter={(item) => {
                              return moment(item)
                                .format("L")
                                .replace(
                                  new RegExp(
                                    "[^.]?" + moment().format("YYYY") + ".?"
                                  ),
                                  ""
                                );
                            }}
                          />
                          <YAxis
                            allowDecimals={false}
                            tick={{
                              fontSize: "0.8em",
                              fontFamily: "Roboto Mono",
                            }}
                            tickSize={10}
                            axisLine={false}
                            tickLine={false}
                            tickMargin={10}
                          />
                          <Tooltip
                            contentStyle={{ borderRadius: "7px" }}
                            labelStyle={{ fontWeight: 500 }}
                            labelFormatter={(value) => {
                              return moment(value)
                                .format("L")
                                .replace(
                                  new RegExp(
                                    "[^.]?" + moment().format("YYYY") + ".?"
                                  ),
                                  ""
                                );
                            }}
                            formatter={(value, name, props) => {
                              return [
                                value,
                                intl.formatMessage(messages.peopleChartLabel),
                              ];
                            }}
                          />
                          <Area
                            type="monotone"
                            key="people_count"
                            dataKey="people_count"
                            fill="#F9AE3B"
                            strokeWidth={0}
                            fillOpacity="1"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </InteractionsContent>
              </>
            ) : null}
          </div>
          {impulsaTracks && impulsaTracks.length ? (
            <div className="dashboard-section impulsa-section">
              <h2>
                <FormattedMessage
                  id="app.dashboard.impulsa.title"
                  defaultMessage="Support materials from {impulsa}"
                  values={{
                    impulsa: (
                      <a
                        href="https://www.impulsa.voto/"
                        rel="external"
                        title="Im.pulsa"
                        target="_blank"
                      >
                        <img src="/images/impulsa.svg" alt="Im.pulsa" />
                      </a>
                    ),
                  }}
                />
              </h2>
              <SupportMaterials>
                {impulsaTracks.map((track) => (
                  <li key={track.id}>
                    <h3
                      dangerouslySetInnerHTML={{ __html: track.title.rendered }}
                    />
                    <p>{track.countries.join(", ")}</p>
                    <p>
                      <FormattedMessage
                        id="app.dashboard.impulsa.track.materials_count"
                        defaultMessage="{count} materials"
                        values={{
                          count: track.materials_count,
                        }}
                      />
                    </p>
                    <p>
                      <FormattedMessage
                        id="app.dashboard.impulsa.track.minutes"
                        defaultMessage="{time} minutes"
                        values={{
                          time: track.reading_time,
                        }}
                      />
                    </p>
                    <Button href={track.link} rel="external" target="_blank">
                      <FormattedMessage
                        id="app.dashboard.impulsa.track.link_text"
                        defaultMessage="View"
                      />
                    </Button>
                  </li>
                ))}
              </SupportMaterials>
            </div>
          ) : null}
        </section>
      </Container>
    );
  }
}

DashboardDemoPage.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(DashboardDemoPage);
