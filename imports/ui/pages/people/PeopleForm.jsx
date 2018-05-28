import React from "react";
import styled from "styled-components";
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
    this.state = {};
    this._handleFacebookClick = this._handleFacebookClick.bind(this);
  }
  _handleFacebookClick() {}
  render() {
    const { loading, person, campaign } = this.props;
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
            <Icon name="facebook" /> Connect with your Facebook profile
          </Button>
          <Divider />
          <Form>
            <Form.Field control={Input} label="Your age" />
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
