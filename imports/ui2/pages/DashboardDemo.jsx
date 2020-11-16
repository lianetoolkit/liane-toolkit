import React from "react";
import styled from "styled-components";
import Page from "/imports/ui2/components/Page.jsx";
import Loading from "/imports/ui2/components/Loading.jsx";
import Button from "/imports/ui2/components/Button.jsx";
import moment from "moment";
// import "@nivo/core";
// import { ResponsiveFunnel } from "@nivo/funnel";
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
    }
    .intro {
      width: 20%;
      flex: 0 0 auto;
      margin: 0 8rem 0 0;
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
        align-items: center;
        font-size: 1.6em;
        line-height: 1.2;
        font-weight: 500;
        letter-spacing: -0.05rem;
        margin: 0 0 4rem;
        .number {
          font-size: 2.8em;
          margin-right: 2rem;
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
    cursor: default;
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
    &:hover {
      background: rgba(51, 0, 102, 0.15);
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
    };
  }
  processChart = (data) => {
    // let chart = {};
    //
    // return chart;
    return data;
  };
  _getInteractionChartData = (data) => {
    let response = [];
    for (const day in data) {
      response.push({
        day,
        comments: Math.floor(Math.random() * 10),
        likes: Math.floor(Math.random() * 10),
        love: Math.floor(Math.random() * 10),
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

    // Charts data
    const chartsPromise = createPromise();
    promises.push(chartsPromise);
    Meteor.call(
      "dashboard.chartsData",
      {
        campaignId: campaign._id,
      },
      (err, data) => {
        if (err) {
          console.log("dashboard.chartsData error ", err);
        } else {
          this.setState({ chartsData: this.processChart(data) });
        }
        chartsPromise.resolve();
      }
    );

    Promise.all(promises).then(() => {
      this.setState({ loading: false });
    });
  }
  getChartItemBgColor(index, total) {
    return `rgba(51,0,102, ${(10 + (90 / total) * index) / 100})`;
  }
  render() {
    const { user, campaign } = this.props;
    const {
      loading,
      summaryData,
      achievements,
      funnelData,
      chartsData,
    } = this.state;
    console.log({ chartsData });
    if (loading) {
      return <Loading full />;
    }
    return (
      <Container>
        <header className="dashboard-header">
          <div className="intro">
            <h1>Hello, {user.name} 🌵</h1>
            <p>
              Welcome to Liane, we have a lot of work to do to improve
              participation in this community
            </p>
          </div>
          <div className="data">
            <div className="total-people main-data">
              <span className="number">{summaryData.totalPeople}</span>
              <span className="text">
                people <br /> in your database
              </span>
            </div>
            <div className="positive-reactions secondary-data">
              <span className="number">{summaryData.positiveReactions}</span>
              <span className="text">positive responses</span>
              <Button>View reactions</Button>
            </div>
            <div className="comments secondary-data">
              <span className="number">{summaryData.comments}</span>
              <span className="text">comments</span>
              <Button>Manage comments</Button>
            </div>
            <div className="people-pm secondary-data">
              <span className="number">{summaryData.peoplePM}</span>
              <span className="text">people to send private messages</span>
              <Button>Send messages</Button>
            </div>
          </div>
        </header>
        <section className="dashboard-sections">
          <div className="dashboard-section">
            <h2>Conversion Funnel</h2>
            <div className="funnel">
              <div className="funnel-chart">
                <div className="funnel-chart-content">
                  <ul>
                    <li
                      style={{
                        backgroundColor: this.getChartItemBgColor(1, 4),
                      }}
                    >
                      {funnelData.totalPeople}
                    </li>
                    <li
                      style={{
                        backgroundColor: this.getChartItemBgColor(2, 4),
                      }}
                    >
                      {funnelData.positivePeople}
                    </li>
                    <li
                      style={{
                        backgroundColor: this.getChartItemBgColor(3, 4),
                      }}
                    >
                      {funnelData.commentingPeople}
                    </li>
                    <li
                      style={{
                        backgroundColor: this.getChartItemBgColor(4, 4),
                      }}
                    >
                      {funnelData.campaignFormPeople}
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
                <p>People in your database</p>
                <p>With positive reactions</p>
                <p>Are talking to us</p>
                <p className="highlight">Filled out your campaign form</p>
                <div>&nbsp;</div>
              </div>
            </div>
          </div>
          <div className="dashboard-section">
            <h2>Your achievements</h2>
            <Achievements>
              <li>
                <FontAwesomeIcon icon="align-left" />
                <span className="number">{achievements.filledForms}</span>
                <span className="label">completed forms</span>
                <Button>Form settings</Button>
              </li>
              <li>
                <FontAwesomeIcon icon="map-marked" />
                <span className="number">{achievements.geolocated}</span>
                <span className="label">mapped people</span>
                <Button>View your map</Button>
              </li>
              <li>
                <FontAwesomeIcon icon="comment" />
                <span className="number">{achievements.commentsReplies}</span>
                <span className="label">comments replies</span>
                <Button>Reply comments</Button>
              </li>
            </Achievements>
          </div>
          <div className="dashboard-section">
            <h2>Interactions evolution</h2>
            <ChartNav>
              <a href="#">Last 7 days</a>
              <a href="#">This month</a>
              <a href="#">Last 30 days</a>
              <a href="#">Last 3 months</a>
            </ChartNav>
            <ResponsiveContainer width="100%" height={450}>
              <AreaChart
                data={this._getInteractionChartData(
                  chartsData.interactionHistory
                )}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                {/* <CartesianGrid strokeDasharray="3 3" /> */}
                <XAxis
                  dataKey="day"
                  tickFormatter={(item) => {
                    return moment(item)
                      .format("L")
                      .replace(/[,\/-/.]*\s*Y+\s*/, "");
                  }}
                />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="comments"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                />
                <Area
                  type="monotone"
                  dataKey="likes"
                  stackId="1"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                />
                <Area
                  type="monotone"
                  dataKey="love"
                  stackId="1"
                  stroke="#ffc658"
                  fill="#ffc658"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="dashboard-section">
            <h2>
              #{campaign._id} - {campaign.name} Demo Dashboard
            </h2>
            <pre>summaryData: {JSON.stringify(summaryData)}</pre>
            <pre>achievements: {JSON.stringify(achievements)}</pre>
            <pre>funnelData: {JSON.stringify(funnelData)}</pre>
            <pre>chartsData: {JSON.stringify(chartsData)}</pre>
          </div>
        </section>
      </Container>
    );
  }
}

export default DashboardDemoPage;
