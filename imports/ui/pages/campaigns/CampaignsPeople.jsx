import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import { Alerts } from "/imports/ui/utils/Alerts.js";
import PeopleImport from "/imports/ui/components/people/PeopleImport.jsx";
import PeopleSummary from "/imports/ui/components/people/PeopleSummary.jsx";
import PeopleSearch from "/imports/ui/components/people/PeopleSearch.jsx";
import PeopleActivityFilter from "/imports/ui/components/entries/ActivityFilter.jsx";
import PeopleActivity from "/imports/ui/components/entries/Activity.jsx";
import PeopleManageImports from "/imports/ui/components/people/PeopleManageImports.jsx";
import XLSX from "xlsx";

import {
  Grid,
  Header,
  Menu,
  List,
  Button,
  Icon,
  Checkbox,
  Divider
} from "semantic-ui-react";

export default class CampaignsPeople extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      isLoading: false,
      importData: null,
      activityQuery: {}
    };
    this._handleEditModeClick = this._handleEditModeClick.bind(this);
    this._handleExport = this._handleExport.bind(this);
    this._handleImportClick = this._handleImportClick.bind(this);
    this._handleImport = this._handleImport.bind(this);
    this._handleImportSubmit = this._handleImportSubmit.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    const { importCount } = this.props;
    if (importCount && importCount > 0 && nextProps.importCount === 0) {
      Alerts.success("People import has finished");
      setTimeout(() => {
        location.reload();
      }, 1000);
    }
  }
  _handleEditModeClick(ev) {
    ev.preventDefault();
    this.setState({
      editMode: !this.state.editMode
    });
  }
  _handleExport(ev) {
    ev.preventDefault();
    const { campaign } = this.props;
    const { query } = this.state;
    this.setState({ isLoading: true });
    Meteor.call(
      "people.export",
      {
        campaignId: campaign._id,
        rawQuery: query ? query.query : {},
        options: query ? query.options : {}
      },
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
      let bytes = new Uint8Array(reader.result);
      const wb = XLSX.read(bytes, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      this.setState({ importData: json, importFilename: file.name });
    };
    reader.readAsArrayBuffer(file);
  }
  _handleImportSubmit(err, res) {
    if (!err) {
      this.setState({ importData: null });
      Alerts.success("Import has started");
    } else {
      Alerts.error(err);
    }
  }
  _handleSearchQueryChange = (query, options) => {
    this.setState({ query: { query, options } });
  };
  render() {
    const {
      isLoading,
      editMode,
      importData,
      importFilename,
      activityQuery
    } = this.state;
    const {
      loading,
      tags,
      importCount,
      facebookId,
      campaign,
      account,
      navTab,
      activity,
      lists
    } = this.props;
    const { accounts } = campaign;
    return (
      <div>
        <PageHeader
          title={`Campaign: ${campaign ? campaign.name : ""}`}
          titleTo={FlowRouter.path("App.campaignDetail", {
            campaignId: campaign ? campaign._id : ""
          })}
          subTitle="People"
          nav={[
            {
              name: "Directory",
              active: navTab == "directory",
              href: FlowRouter.path("App.campaignPeople", {
                campaignId: campaign._id
              })
            },
            {
              name: "Recent activity",
              active: navTab == "activity",
              href: FlowRouter.path("App.campaignPeople.activity", {
                campaignId: campaign._id
              })
            },
            {
              name: "Manage Imports",
              active: navTab == "imports",
              href: FlowRouter.path("App.campaignPeople.imports", {
                campaignId: campaign._id
              })
            },
            {
              name: "Info",
              active: navTab == "info",
              href: FlowRouter.path("App.campaignPeople.info", {
                campaignId: campaign._id
              })
            }
          ]}
        />
        <section className="content">
          {navTab !== "activity" && loading ? (
            <Loading />
          ) : (
            <Grid>
              {navTab == "info" ? (
                <Grid.Row>
                  <Grid.Column>
                    <PeopleSummary
                      campaignId={campaign._id}
                      facebookId={account.facebookId}
                    />
                  </Grid.Column>
                </Grid.Row>
              ) : null}
              {navTab == "imports" ? (
                <Grid.Row>
                  <Grid.Column>
                    <PeopleManageImports lists={lists} />
                  </Grid.Column>
                </Grid.Row>
              ) : null}
              {navTab == "activity" ? (
                <Grid.Row>
                  <Grid.Column>
                    <PeopleActivityFilter />
                    <Divider hidden />
                    <PeopleActivity
                      loading={loading}
                      campaign={campaign}
                      activity={activity}
                      accounts={accounts}
                      limit={this.props.limit || 10}
                    />
                  </Grid.Column>
                </Grid.Row>
              ) : null}
              {navTab == "directory" ? (
                <>
                  <Grid.Row>
                    <Grid.Column>
                      <Menu>
                        {accounts.map(acc => (
                          <Menu.Item
                            key={`account-${acc._id}`}
                            active={
                              account && acc.facebookId == account.facebookId
                            }
                            href={FlowRouter.path("App.campaignPeople", {
                              campaignId: campaign._id,
                              facebookId: acc.facebookId
                            })}
                          >
                            {acc.name}
                          </Menu.Item>
                        ))}
                        <Menu.Menu position="right" size="tiny">
                          <Menu.Item onClick={this._handleEditModeClick}>
                            <Icon
                              name={`toggle ${editMode ? "on" : "off"}`}
                              color={editMode ? "green" : null}
                            />{" "}
                            Edit mode
                          </Menu.Item>
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
                          {importCount ? (
                            <Menu.Item disabled>
                              <Icon name="spinner" loading /> Currently
                              importing ({importCount})
                            </Menu.Item>
                          ) : (
                            <Menu.Item onClick={this._handleImportClick}>
                              <Icon name="download" /> Import spreadsheet
                            </Menu.Item>
                          )}
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
                          editMode={editMode}
                          tags={tags}
                          onQuery={this._handleSearchQueryChange}
                        />
                      ) : null}
                    </Grid.Column>
                  </Grid.Row>
                </>
              ) : null}
            </Grid>
          )}
          <input
            type="file"
            onChange={this._handleImport}
            style={{ display: "none" }}
            ref={input => (this.importInput = input)}
          />
          <PeopleImport
            data={importData}
            filename={importFilename}
            campaignId={campaign._id}
            onSubmit={this._handleImportSubmit}
          />
        </section>
      </div>
    );
  }
}
