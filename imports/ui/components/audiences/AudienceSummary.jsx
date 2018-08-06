import React from "react";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import styled from "styled-components";
import {
  Grid,
  Header,
  Card,
  Label,
  Divider,
  Table,
  Menu,
  Dimmer,
  Segment,
  List,
  Loader,
  Button,
  Icon
} from "semantic-ui-react";
import AudienceUtils from "./Utils.js";
import SingleLineChart from "./SingleLineChart.jsx";
import AudienceInfo from "./AudienceInfo.jsx";
import LocationChart from "./LocationChart.jsx";
import DataAlert from "./DataAlert.jsx";
import { sum, maxBy, minBy } from "lodash";

const Wrapper = styled.div`
  h2.ui.header {
    font-weight: bold;
  }
  h4.ui.header {
    color: #999;
    text-transform: uppercase;
    font-size: 0.85em;
    font-weight: bold;
    margin: 0 0 0.5rem;
  }
  .ui.horizontal.list {
    width: 100%;
    display: table;
    > .item {
      display: table-cell;
      vertical-align: middle;
    }
  }
  .ui.list {
    > .item {
      font-size: 0.85rem;
      width: 30%;
      &:first-child {
        width: 40%;
        font-size: 1.2rem;
      }
      .header {
        margin-bottom: 0.5rem;
      }
    }
  }
  .ui.list .list > .item > .image + .content,
  .ui.list .list > .item > .icon + .content,
  .ui.list > .item > .image + .content,
  .ui.list > .item > .icon + .content {
    margin-left: 0.75rem;
  }
`;

const ListItem = ({ name, label, icon, color }) => {
  return (
    <List.Item>
      {icon ? <List.Icon name={icon} color={color} /> : null}
      <List.Content>
        <List.Header>{name}</List.Header>
        <Label size="small" color={color}>
          {label}
        </Label>
      </List.Content>
    </List.Item>
  );
};

export default class AudiencePages extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidUpdate() {}
  _latestAudience(item) {
    return item.audiences[item.audiences.length - 1];
  }
  render() {
    const {
      loading,
      facebookAccount,
      summary,
      campaign,
      audienceCategories
    } = this.props;
    const sample = ["Politics", "Culture", "Education"];
    const samplePlaces = ["São Paulo", "Rio de Janeiro", "Brasília"];
    console.log(facebookAccount);
    console.log(summary);
    if (loading && !summary) {
      return <Loading />;
    } else {
      return (
        <Wrapper>
          <Dimmer.Dimmable dimmed={loading}>
            <Dimmer active={loading} inverted>
              <Loader>Loading</Loader>
            </Dimmer>
          </Dimmer.Dimmable>
          <Segment.Group>
            <Segment key={facebookAccount.facebookId}>
              {/* <Header as="h2">{facebookAccount.name}</Header> */}
              <Grid columns={2} widths="equal" stretched>
                <Grid.Row>
                  <Grid.Column>
                    <Header as="h4">Top interests</Header>
                    <List horizontal verticalAlign="middle">
                      {sample.map((item, i) => (
                        <ListItem
                          key={i}
                          icon={i == 0 ? "star" : false}
                          color="orange"
                          name={item}
                          label={`+${10 - i}.0x`}
                        />
                      ))}
                    </List>
                  </Grid.Column>
                  <Grid.Column>
                    <Header as="h4">Bottom interests</Header>
                    <List horizontal verticalAlign="middle">
                      {sample.map((item, i) => (
                        <ListItem
                          key={i}
                          icon={i == 0 ? "star" : false}
                          color="red"
                          name={item}
                          label={`${i - 10}.0x`}
                        />
                      ))}
                    </List>
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column>
                    <Header as="h4">Top places</Header>
                    <List horizontal verticalAlign="middle">
                      {samplePlaces.map((item, i) => (
                        <ListItem
                          key={i}
                          icon={i == 0 ? "map" : false}
                          color="orange"
                          name={item}
                          label={`${50 - i}%`}
                        />
                      ))}
                    </List>
                  </Grid.Column>
                  <Grid.Column>
                    <Header as="h4">Bottom places</Header>
                    <List horizontal verticalAlign="middle">
                      {samplePlaces.map((item, i) => (
                        <ListItem
                          key={i}
                          icon={i == 0 ? "map" : false}
                          color="red"
                          name={item}
                          label={`${10 + i}%`}
                        />
                      ))}
                    </List>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Segment>
          </Segment.Group>
        </Wrapper>
      );
    }
  }
}
