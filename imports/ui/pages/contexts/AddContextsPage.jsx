import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import { Form, Statistic, Grid, Button, Select } from "semantic-ui-react";

import moment from "moment";
const contexts = [{ key: "uno", value: "uno" }, { key: "dos", value: "dos" }];

export default class AddContextPage extends React.Component {
  constructor(props) {
    super(props);
    console.log("AddContextPage init", { props });
    this.state = {
      name: ""
    };
    this._handleSubmit = this._handleSubmit.bind(this);
    this._handleChange = this._handleChange.bind(this);
  }
  _handleChange = (e, { name, value }) => this.setState({ [name]: value });

  _handleSubmit(e) {
    const { name } = this.state;
    if (name) {
      Meteor.call("contexts.create", { name }, (error, data) => {
        if (error) {
          // Alerts.error(error);
          console.log(error);
        } else {
          console.log("yeah");
        }
      });
    }
  }

  render() {
    const { loading, currentUser } = this.props;
    const { name } = this.state;
    return (
      <div>
        <PageHeader title="Add Context" />
        <section className="content">
          {loading ? (
            <Loading />
          ) : (
            <Grid>
              <Grid.Row>
                <Grid.Column>
                  <Form onSubmit={this._handleSubmit}>
                    <Form.Input
                      label="Name"
                      placeholder="Context name"
                      name="name"
                      onChange={this._handleChange}
                      value={name}
                    />
                    <Button type="submit">Submit</Button>
                  </Form>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          )}
        </section>
      </div>
    );
  }
}
