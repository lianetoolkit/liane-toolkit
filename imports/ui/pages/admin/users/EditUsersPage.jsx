import React from "react";
import PropTypes from "prop-types";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import { Form, Input, Select, Grid, Button, Icon } from "semantic-ui-react";
import { Alerts } from "/imports/ui/utils/Alerts.js";

const initialFields = {
  name: "",
  roles: []
};

export default class EditUsersPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: Object.assign({}, initialFields),
      isLoading: false
    };
    this._handleSubmit = this._handleSubmit.bind(this);
    this._handleChange = this._handleChange.bind(this);
    this._handleRemove = this._handleRemove.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.user) {
      if (nextProps.user._id) {
        const { fields } = this.state;
        const { _id, name, roles } = nextProps.user;
        this.setState({
          fields: {
            ...fields,
            _id,
            name,
            roles
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
    const { userId } = this.props;
    const { fields } = this.state;
    this.setState({ isLoading: true });
    if (userId) {
      Meteor.call("users.update", fields, error => {
        this.setState({ isLoading: false });
        if (error) {
          Alerts.error(error);
        } else {
          Alerts.success("User was updated successfully");
        }
      });
    }
  }
  _handleRemove(e) {
    e.preventDefault();
    this.context.confirmStore.show({
      callback: () => {
        const { userId } = this.props;
        this.setState({ isLoading: true });
        if (userId) {
          Meteor.call("users.remove", { userId }, error => {
            this.setState({ isLoading: false });
            if (error) {
              Alerts.error(error);
            } else {
              Alerts.success("User was removed successfully");
              this.context.confirmStore.hide();
              FlowRouter.go("App.admin.users");
            }
          });
        }
      }
    });
  }
  render() {
    const { userId, user, loading, available } = this.props;
    const { fields, isLoading } = this.state;
    return (
      <div>
        <PageHeader
          title="Users"
          titleTo={FlowRouter.path("App.admin.users")}
          subTitle={userId ? `Editing ${user ? user.name : ""}` : "New User"}
        />
        <section className="content">
          {loading ? (
            <Loading />
          ) : (
            <Grid>
              <Grid.Row>
                <Grid.Column>
                  <Form onSubmit={this._handleSubmit} loading={isLoading}>
                    <Form.Field
                      control={Input}
                      label="Name"
                      placeholder="Name"
                      name="name"
                      onChange={this._handleChange}
                      value={fields.name}
                    />
                    <Form.Field
                      control={Select}
                      multiple
                      name="roles"
                      onChange={this._handleChange}
                      value={fields.roles}
                      options={[
                        {
                          key: "admin",
                          value: "admin",
                          text: "Admin"
                        }
                      ]}
                    />
                    {userId ? (
                      <Button onClick={this._handleRemove} negative>
                        <Icon name="trash" />
                        Remove user
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

EditUsersPage.contextTypes = {
  confirmStore: PropTypes.object
};
