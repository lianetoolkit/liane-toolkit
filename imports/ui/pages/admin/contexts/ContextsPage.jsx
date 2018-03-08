import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import { Alerts } from "/imports/ui/utils/Alerts.js";

import { Grid, Segment, Table, Icon, Button, Divider } from "semantic-ui-react";

import moment from "moment";

export default class ContextsPage extends React.Component {
  static defaultProps = {
    contexts: []
  };
  constructor(props) {
    super(props);
    this.state = {};
    this._handleExportClick = this._handleExportClick.bind(this);
    this._handleImportClick = this._handleImportClick.bind(this);
    this._handleImport = this._handleImport.bind(this);
  }
  _handleImportClick(ev) {
    ev.preventDefault();
    this.importInput.click();
  }
  _handleImport(ev) {
    this.setState({ loading: true });
    let file = ev.currentTarget.files[0];
    const reader = new FileReader();
    if (file.type == "application/json" || file.type == "text/json") {
      reader.onload = () => {
        Meteor.call(
          "contexts.import",
          {
            fileInfo: {
              name: file.name,
              size: file.size,
              type: file.type
            },
            fileData: reader.result
          },
          (error, result) => {
            this.setState({ loading: false });
            if (error) {
              console.log(error);
              Alerts.error(error);
            } else {
              Alerts.success(
                "Context and its configuration imported successfully"
              );
            }
          }
        );
      };
      reader.readAsText(file, "utf-8");
    } else {
      Alerts.error(
        "File format not accepted. The import file must be of JSON format."
      );
    }
  }
  _handleExportClick(contextId) {
    return ev => {
      ev.preventDefault();
      Meteor.call("contexts.export", { contextId }, (error, result) => {
        if (error) {
          console.log(error);
          Alerts.error(error);
        } else {
          const dataStr =
            "data:text/json;charset=utf-8," +
            encodeURIComponent(JSON.stringify(result));
          const anchor = document.getElementById("export-anchor");
          anchor.setAttribute("href", dataStr);
          anchor.setAttribute("download", `context-${result.context._id}.json`);
          setTimeout(() => {
            console.log("clicking");
            anchor.click();
          }, 200);
        }
      });
    };
  }
  render() {
    const { loading, contexts, currentUser } = this.props;
    return (
      <div>
        <PageHeader title="Contexts" />
        <section className="content">
          {loading || this.state.loading ? (
            <Loading />
          ) : (
            <Grid>
              <Grid.Row>
                <Grid.Column>
                  <Button.Group floated="right">
                    <Button
                      as="a"
                      href={FlowRouter.path("App.admin.contexts.edit")}
                    >
                      <Icon name="plus" />
                      New context
                    </Button>
                    <Button onClick={this._handleImportClick}>
                      <Icon name="upload" />
                      Import context
                    </Button>
                  </Button.Group>
                  <Divider hidden clearing />
                  <Table>
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Locations</Table.HeaderCell>
                        <Table.HeaderCell>Audience Categories</Table.HeaderCell>
                        <Table.HeaderCell>Campaigns</Table.HeaderCell>
                        <Table.HeaderCell>Actions</Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {contexts.map(context => (
                        <Table.Row key={context._id}>
                          <Table.Cell>{context.name}</Table.Cell>
                          <Table.Cell>
                            {context.mainGeolocation
                              ? context.mainGeolocation.name
                              : ""}
                            {context.geolocations.length
                              ? ` +${context.geolocations.length} location(s)`
                              : ""}
                          </Table.Cell>
                          <Table.Cell>
                            {context.audienceCategories
                              ? context.audienceCategories
                                  .map(
                                    audienceCategory => audienceCategory.title
                                  )
                                  .join(", ")
                              : ""}
                          </Table.Cell>
                          <Table.Cell>
                            {context.campaigns.length} campaign(s)
                          </Table.Cell>
                          <Table.Cell>
                            <Button.Group basic fluid>
                              <Button
                                href={FlowRouter.path(
                                  "App.admin.contexts.edit",
                                  {
                                    contextId: context._id
                                  }
                                )}
                              >
                                Edit
                              </Button>
                              <Button
                                href="#"
                                onClick={this._handleExportClick(context._id)}
                              >
                                Export
                              </Button>
                            </Button.Group>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          )}
          <a id="export-anchor" />
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
