import React from "react";
import {
  Dimmer,
  Divider,
  Container,
  Button,
  Header,
  Icon
} from "semantic-ui-react";

export default class NotFoundPage extends React.Component {
  constructor(props) {
    super(props);
    console.log("NotFoundPage init", { props });
  }
  render() {
    return (
      <Container fluid>
        <Dimmer active={true}>
          <Header as="h2" icon textAlign="center" inverted>
            <Icon name="frown" inverted />
            <Header.Content>Oooops! Sorry, Page not found.</Header.Content>
          </Header>
          <Divider hidden section />
          <Button size="big" primary as="a" href="/">
            Return to home page
          </Button>
        </Dimmer>
      </Container>
    );
  }
}
