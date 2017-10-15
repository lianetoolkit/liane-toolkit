import React from "react";
import PageHeader from "/imports/ui/components/admin/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";

import ProxiesTable from "/imports/ui/components/proxies/ProxiesTable.jsx";
import ProxiesPackagesTable from "/imports/ui/components/proxies/ProxiesPackagesTable.jsx";
import AddProxiesPackages from "/imports/ui/components/proxies/AddProxiesPackages.jsx";
import ProxiesStats from "/imports/ui/components/proxies/ProxiesStats.jsx";

import { Grid, Divider } from "semantic-ui-react";
import moment from "moment";

export default class ProxiesPage extends React.Component {
  constructor(props) {
    super(props);
    // console.log("ServiceAccountsPage init", { props });
  }

  render() {
    const { loading, currentUser } = this.props;
    return (
      <div>
        <PageHeader title="Proxies" />
        <section className="content">
          {loading
            ? <Loading />
            : <Grid>
                <Grid.Row>
                  <Grid.Column>
                    <ProxiesStats
                      hours={48}
                      timeOffset={moment().utcOffset()}
                    />
                  </Grid.Column>
                </Grid.Row>
                <Divider />
                <Grid.Row>
                  <Grid.Column>
                    <AddProxiesPackages />
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column>
                    <ProxiesPackagesTable />
                  </Grid.Column>
                </Grid.Row>
                <Divider />
                <Grid.Row>
                  <Grid.Column>
                    <ProxiesTable />
                  </Grid.Column>
                </Grid.Row>
              </Grid>}
        </section>
      </div>
    );
  }
}
