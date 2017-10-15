import React from "react";
import PageHeader from "/imports/ui/components/admin/PageHeader.jsx";
import SmallBox from "/imports/ui/components/utils/SmallBox.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import { Card, Statistic, Grid, Header, Button } from "semantic-ui-react";

import moment from "moment";

export default class DashboardPage extends React.Component {
  constructor(props) {
    super(props);
    console.log("DashboardPage init", { props });
    this.state = { field: "instagram.total" };
    this._selectStatsFilter = this._selectStatsFilter.bind(this);
  }

  _selectStatsFilter(e, data) {
    const field = data.name;
    const color = data.color;
    this.setState({ field, color });
  }

  render() {
    const { loading, counters, currentUser } = this.props;
    return (
      <div>
        <PageHeader title="Home" />
        <section className="content">
          {loading ? (
            <Loading />
          ) : (
            <Grid>
              <Grid.Row>
                <Grid.Column>
                  <Header as="h3">Counters</Header>
                  <Card.Group>
                    {counters.map(counter => (
                      <Card
                        key={counter.name}
                        href={FlowRouter.path(`Admin.${counter.name}`)}
                      >
                        <Statistic
                          size="small"
                          value={counter.count.toString()}
                          label={counter.name}
                        />
                      </Card>
                    ))}
                  </Card.Group>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          )}
        </section>
      </div>
    );
  }
}
