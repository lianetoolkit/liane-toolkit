import React from "react";
import PropTypes from "prop-types";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import AudiencesTargetingSpecForm from "/imports/ui/components/audiences/AudiencesTargetingSpecForm.jsx";
import { Form, Grid, Button, Icon } from "semantic-ui-react";
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
    this._handleRemove = this._handleRemove.bind(this);
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
      Meteor.call(
        "audienceCategories.create",
        fields,
        (error, audienceCategoryId) => {
          this.setState({ isLoading: false });
          if (error) {
            Alerts.error(error);
          } else {
            Alerts.success("Audience category was created successfully");
            FlowRouter.withReplaceState(function() {
              FlowRouter.setParams({ audienceCategoryId });
            });
          }
        }
      );
    }
  }
  _handleRemove(e) {
    e.preventDefault();
    this.context.confirmStore.show({
      callback: () => {
        const { audienceCategoryId } = this.props;
        this.setState({ isLoading: true });
        if (audienceCategoryId) {
          Meteor.call(
            "audienceCategories.remove",
            { audienceCategoryId },
            error => {
              this.setState({ isLoading: false });
              if (error) {
                Alerts.error(error);
              } else {
                Alerts.success("Audience category was removed successfully");
                this.context.confirmStore.hide();
                FlowRouter.go("App.admin.audienceCategories");
              }
            }
          );
        }
      }
    });
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
            audienceCategoryId
              ? `Editing ${audienceCategory ? audienceCategory.title : ""}`
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
                    {audienceCategoryId ? (
                      <Button onClick={this._handleRemove} negative>
                        <Icon name="trash" />
                        Remove audience category
                      </Button>
                    ) : (
                      ""
                    )}
                    <Button primary>
                      <Icon name="save" />
                      Save
                    </Button>
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

EditAudienceCategoriesPage.contextTypes = {
  confirmStore: PropTypes.object
};
