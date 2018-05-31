import React from "react";
import styled from "styled-components";
import { OAuth } from "meteor/oauth";
import {
  Dimmer,
  Loader,
  Container,
  Header,
  Divider,
  Form,
  Input,
  Button,
  Message,
  Icon
} from "semantic-ui-react";

const Wrapper = styled.div`
  max-width: 700px;
  margin: 4rem auto;
`;

export default class PeopleForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {}
    };
    this._handleFacebookClick = this._handleFacebookClick.bind(this);
    this._handleSubmit = this._handleSubmit.bind(this);
  }
  _handleChange = (ev, { name, value }) => {
    this.setState({
      ...this.state.formData,
      formData: {
        [name]: value
      }
    });
  };
  _handleFacebookClick() {
    Facebook.requestCredential(
      {
        requestPermissions: [
          "public_profile",
          "email",
          "user_birthday",
          "user_location",
          "user_gender",
          "user_age_range",
          "user_link"
        ]
      },
      token => {
        // console.log(OAuth);
        // console.log(Accounts.oauth);
        const secret = OAuth._retrieveCredentialSecret(token) || null;
        Meteor.call(
          "peopleForm.authFacebook",
          { token, secret },
          (err, res) => {
            if (err) {
              console.log(err);
            } else {
              this.setState({
                formData: {
                  ...this.state.formData,
                  facebookLink: res.link,
                  email: res.email
                }
              });
            }
          }
        );
      }
    );
  }
  _handleDeleteDataClick() {
    Facebook.requestCredential({
      requestPermissions: []
    });
  }
  _handleSubmit() {
    const { formId } = this.props;
    const { formData } = this.state;
    Meteor.call("peopleForm.submit", { formId, ...formData }, (err, res) => {
      console.log(err, res);
      FlowRouter.go("/f/" + res);
    });
  }
  render() {
    const { loading, person, campaign } = this.props;
    const { formData } = this.state;
    if (loading) {
      return (
        <Dimmer active>
          <Loader />
        </Dimmer>
      );
    } else if (person && campaign) {
      return (
        <Wrapper>
          <Header size="huge">Hello {person.name}!</Header>
          <Header size="large">
            Help {campaign.name} campaign by filling out this form.
          </Header>
          <Button
            fluid
            color="facebook"
            icon
            onClick={this._handleFacebookClick}
          >
            <Icon name="facebook" /> Autofill with your Facebook profile
          </Button>
          <Divider />
          <Form onSubmit={this._handleSubmit}>
            <Form.Field
              name="email"
              control={Input}
              label="Email"
              value={formData.email}
              onChange={this._handleChange}
            />
            <Form.Field
              name="cellphone"
              control={Input}
              label="Cellphone"
              value={formData.cellphone}
              onChange={this._handleChange}
            />
            <Form.Field
              name="birthday"
              control={Input}
              label="Birthday"
              type="date"
              value={formData.birthday}
              onChange={this._handleChange}
            />
            <Button fluid>Submit</Button>
          </Form>
        </Wrapper>
      );
    } else {
      return (
        <Wrapper>
          <Message
            color="red"
            icon="warning sign"
            header="Invalid request"
            content="Form is not available for this request."
          />
        </Wrapper>
      );
    }
  }
}
