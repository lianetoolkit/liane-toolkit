import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import { Alerts } from "/imports/ui/utils/Alerts.js";
import PeopleTable from "/imports/ui/components/people/PeopleTable.jsx";
import PeopleSearch from "/imports/ui/components/people/PeopleSearch.jsx";
import PeopleSummary from "/imports/ui/components/people/PeopleSummary.jsx";
import XLSX from "xlsx";

import { Grid, Header, Menu, List, Button, Icon } from "semantic-ui-react";

export default class CampaignsPeople extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false
    };
    this._handleExport = this._handleExport.bind(this);
    this._handleImportClick = this._handleImportClick.bind(this);
    this._handleImport = this._handleImport.bind(this);
  }
  _handleExport(ev) {
    ev.preventDefault();
    const { campaign } = this.props;
    this.setState({ isLoading: true });
    Meteor.call(
      "people.export",
      { campaignId: campaign._id },
      (error, result) => {
        this.setState({ isLoading: false });
        if (error) {
          Alerts.error(error);
        } else {
          const blob = new Blob([result], { type: "text/csv;charset=utf-8" });
          saveAs(blob, `${campaign.name}-people.csv`);
        }
      }
    );
  }
  _handleImportClick(ev) {
    ev.preventDefault();
    this.importInput.click();
  }
  _handleImport(ev) {
    const { campaign } = this.props;
    this.setState({ loading: true });
    let file = ev.currentTarget.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      let binary = "";
      let bytes = new Uint8Array(reader.result);
      for(let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const wb = XLSX.read(binary, { type: "binary" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      console.log(json);
      // Meteor.call(
      //   "people.import",
      //   {
      //     campaignId: campaign._id,
      //     fileInfo: {
      //       name: file.name,
      //       size: file.size,
      //       type: file.type
      //     },
      //     fileData: { data: reader.result }
      //   },
      //   (error, result) => {
      //     this.setState({ loading: false });
      //     if (error) {
      //       console.log(error);
      //       Alerts.error(error);
      //     } else {
      //       Alerts.success("Import has started");
      //     }
      //   }
      // );
    };
    reader.readAsArrayBuffer(file);
  }
  render() {
    const { isLoading } = this.state;
    const { loading, facebookId, campaign, account } = this.props;
    const { accounts } = campaign;
    return (
      <div>
        <PageHeader
          title={`Campaign: ${campaign ? campaign.name : ""}`}
          titleTo={FlowRouter.path("App.campaignDetail", {
            campaignId: campaign ? campaign._id : ""
          })}
          subTitle="People"
        />
        <section className="content">
          {loading ? (
            <Loading />
          ) : (
            <Grid>
              <Grid.Row>
                <Grid.Column>
                  <Menu>
                    {accounts.map(acc => (
                      <Menu.Item
                        key={`account-${acc._id}`}
                        active={account && acc.facebookId == account.facebookId}
                        href={FlowRouter.path("App.campaignPeople", {
                          campaignId: campaign._id,
                          facebookId: acc.facebookId
                        })}
                      >
                        {acc.name}
                      </Menu.Item>
                    ))}
                    <Menu.Menu position="right">
                      <Menu.Item
                        onClick={this._handleExport}
                        disabled={isLoading}
                      >
                        <Icon
                          name={isLoading ? "spinner" : "upload"}
                          loading={isLoading}
                        />{" "}
                        Export CSV
                      </Menu.Item>
                      <Menu.Item onClick={this._handleImportClick}>
                        <Icon name="download" /> Import spreadsheet
                      </Menu.Item>
                    </Menu.Menu>
                  </Menu>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column>
                  {account ? (
                    <PeopleSearch
                      campaignId={campaign._id}
                      facebookId={account.facebookId}
                    />
                  ) : null}
                  {/* <PeopleSummary
                    facebookId={facebookId}
                    campaignId={campaign._id}
                    peopleSummary={peopleSummary}
                  /> */}
                </Grid.Column>
              </Grid.Row>
            </Grid>
          )}
          <input
            type="file"
            onChange={this._handleImport}
            style={{ display: "none" }}
            ref={input => (this.importInput = input)}
          />
        </section>
      </div>
    );
  }
}
