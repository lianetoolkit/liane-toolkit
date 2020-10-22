import React from "react";
import styled from "styled-components";
import Page from "/imports/ui2/components/Page.jsx";
import Loading from "/imports/ui2/components/Loading.jsx";
import Button from "/imports/ui2/components/Button.jsx";
// import "@nivo/core";
import { ResponsiveFunnel } from "@nivo/funnel";

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
      width: 25%;
      flex: 0 0 auto;
      margin: 0 8rem 0 0;
      h1 {
        font-size: 1.2em;
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
    padding: 2rem;
    border-radius: 7px;
    background: #fff;
    color: #333;
    box-sizing: border-box;
    overflow: hidden;
    .funnel {
      height: 500px;
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
          console.log("funnel", data);
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
        startDate: "2020-08-24",
        endDate: "2020-09-15",
      },
      (err, data) => {
        if (err) {
          console.log("dashboard.chartsData error ", err);
        } else {
          this.setState({ chartsData: data });
        }
        chartsPromise.resolve();
      }
    );

    Promise.all(promises).then(() => {
      this.setState({ loading: false });
    });
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
          <div className="funnel">
            <ResponsiveFunnel
              data={[
                {
                  id: "total_people",
                  value: funnelData.totalPeople,
                  label: "Total people",
                },
                {
                  id: "positivePeople",
                  value: funnelData.positivePeople,
                  label: "Positive people",
                },
                {
                  id: "commentingPeople",
                  value: funnelData.commentingPeople,
                  label: "Commenting people",
                },
                {
                  id: "campaignFormPeople",
                  value: funnelData.campaignFormPeople,
                  label: "Campaign form",
                },
              ]}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              spacing={1}
              shapeBlending={0}
              colors={{ scheme: "spectral" }}
              borderWidth={0}
              borderOpacity={0}
              labelColor={{ from: "color", modifiers: [["darker", 3]] }}
              enableBeforeSeparators={false}
              enableAfterSeparators={true}
              afterSeparatorLength={100}
              afterSeparatorOffset={20}
              isInteractive={false}
              currentPartSizeExtension={5}
              currentBorderWidth={40}
              animate={false}
            />
          </div>
          <h2>
            #{campaign._id} - {campaign.name} Demo Dashboard
          </h2>
          <pre>summaryData: {JSON.stringify(summaryData)}</pre>
          <pre>achievements: {JSON.stringify(achievements)}</pre>
          <pre>funnelData: {JSON.stringify(funnelData)}</pre>
          <pre>chartsData: {JSON.stringify(chartsData)}</pre>
        </section>
      </Container>
    );
  }
}

export default DashboardDemoPage;
