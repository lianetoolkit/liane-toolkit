import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import AudiencesTargetingSpecForm from "/imports/ui/components/audiences/AudiencesTargetingSpecForm.jsx";
import { Form, Grid, Button, Select, Dropdown } from "semantic-ui-react";
import { Alerts } from "/imports/ui/utils/Alerts.js";

const initialFields = {
  title: "",
  spec: {
    interests: []
  }
};

export default class EditAudienceCategoriesPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: Object.assign({}, initialFields)
    };
    this._handleChange = this._handleChange.bind(this);
    this._handleSubmit = this._handleSubmit.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.audienceCategory) {
      if (nextProps.audienceCategory._id) {
        const { fields } = this.state;
        const { _id, title, spec } = nextProps.audienceCategory;
        this.setState({
          fields: {
            ...fields,
            _id,
            title,
            spec
          }
        });
      } else {
        this.setState({
          fields: Object.assign({}, initialFields)
        });
      }
    }
  }
  _handleChange = (e, { name, value }) =>
    this.setState({
      fields: Object.assign({}, this.state.fields, { [name]: value })
    });
  _handleSubmit(e) {
    const { audienceCategoryId } = this.props;
    const { fields } = this.state;
    this.setState({ isLoading: true });
    if (audienceCategoryId) {
      Meteor.call("audienceCategories.update", fields, error => {
        this.setState({ isLoading: false });
        if (error) {
          Alerts.error(error);
        } else {
          Alerts.success("Audience category was updated successfully");
        }
      });
    } else {
      Meteor.call("audienceCategories.create", fields, (error, audienceCategoryId) => {
        this.setState({ isLoading: false });
        if (error) {
          Alerts.error(error);
        } else {
          Alerts.success("Audience category was created successfully");
          FlowRouter.withReplaceState(function() {
            FlowRouter.setParams({ audienceCategoryId });
          });
        }
      });
    }
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
    const {
      audienceCategoryId,
      audienceCategory,
      loading,
      currentUser
    } = this.props;
    const { fields } = this.state;
    return (
      <div>
        <PageHeader
          title="Audience Categories"
          titleTo={FlowRouter.path("App.admin.audienceCategories")}
          subTitle={
            audienceCategoryId && audienceCategory
              ? `Editing ${audienceCategory.title}`
              : "New Audience Category"
          }
        />
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
