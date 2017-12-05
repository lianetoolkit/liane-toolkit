import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import AudiencesTargetingSpecForm from "/imports/ui/components/audiences/AudiencesTargetingSpecForm.jsx";
import { Form, Grid, Button, Select, Dropdown } from "semantic-ui-react";
import { Alerts } from "/imports/ui/utils/Alerts.js";

export default class AddAudienceCategoriesPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: {
        title: "",
        spec: {
          interests: []
        }
      }
    };
    this._handleChange = this._handleChange.bind(this);
    this._handleSubmit = this._handleSubmit.bind(this);
  }
  _handleChange = (e, { name, value }) =>
    this.setState({
      fields: Object.assign({}, this.state.fields, { [name]: value })
    });
  _handleSubmit(e) {
    const { fields } = this.state;
    this.setState({ isLoading: true });
    Meteor.call("facebook.audienceCategories.create", fields, (error, data) => {
      this.setState({ isLoading: false });
      if (error) {
        Alerts.error(error);
      } else {
        Alerts.success("Audience category was created successfully");
      }
    });
  }
  getCategory(id) {
    // this.service.get(id).then(data => {
    //   this.setState({
    //     category: data
    //   });
    // });
  }
  componentDidUpdate() {
    console.log(this.state);
  }
  componentWillReceivesProps(nextProps) {
    if (nextProps.id !== this.props.id) {
      if (nextProps.id) {
        this.getCategory(nextProps.id);
      } else {
        this.setState(Object.assign({}, initialCategory));
      }
    }
  }
  render() {
    const { loading, currentUser } = this.props;
    const { fields } = this.state;
    return (
      <div>
        <PageHeader title="Add Audience Category" />
        <section className="content">
          {loading ? (
            <Loading />
          ) : (
            <Grid>
              <Grid.Row>
                <Grid.Column>
                  <Form onSubmit={this._handleSubmit}>
                    <Form.Input
                      size="big"
                      placeholder="Title"
                      name="title"
                      value={fields.title}
                      onChange={this._handleChange}
                    />
                    <AudiencesTargetingSpecForm
                      name="spec"
                      value={fields.spec}
                      onChange={this._handleChange}
                    />
                    <Button>Send</Button>
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
