import React from "react";
import { Meteor } from "meteor/meteor";
import PageHeader from "/imports/ui/components/admin/PageHeader.jsx";
import UserInfo from "/imports/ui/components/users/detail/UserInfo.jsx";
import UserSubscriptions
  from "/imports/ui/components/users/detail/UserSubscriptions.jsx";
import UserOrders from "/imports/ui/components/users/detail/UserOrders.jsx";
import UserJobs from "/imports/ui/components/users/detail/UserJobs.jsx";
import ServiceAccountsTable
  from "/imports/ui/components/serviceAccounts/ServiceAccountsTable.jsx";
import EmailsTable from "/imports/ui/components/emails/EmailsTable.jsx";
import UsersEventsTable
  from "/imports/ui/components/users/UsersEventsTable.jsx";
import UsersDetailHeader
  from "/imports/ui/components/users/detail/UsersDetailHeader.jsx";

import Loading from "/imports/ui/components/utils/Loading.jsx";
import { Menu, Segment, Icon, Divider } from "semantic-ui-react";
const tabs = [
  "info",
  "accounts",
  "subscriptions",
  "orders",
  "emails",
  "jobs",
  "errors",
  "tickets",
  "events"
];

export default class UsersDetailPage extends React.Component {
  constructor(props) {
    super(props);
    console.log("UsersDetailPage init", { props });
    this.state = this._getInitialState();
  }
  _getInitialState() {
    const routeParam = FlowRouter.getParam("tab");
    return { activeItem: routeParam ? routeParam : "info" };
  }
  _handleItemClick = (e, { name }) => {
    const { userId } = this.props;
    if (name == "tickets") {
      window.open(`http://elevenyellow.zendesk.com/`, "_blank");
    }
    FlowRouter.go(`/user/${userId}/${name}`);
    this.setState({ activeItem: name });
  };

  render() {
    const { userId, loading, user } = this.props;
    const { activeItem } = this.state;
    return (
      <div>
        <PageHeader title="Users" subTitle={userId} />
        <section className="content">
          {loading
            ? <Loading />
            : <div>
                <UsersDetailHeader user={user} />
                <Menu stackable widths={tabs.length}>
                  {tabs.map(item => (
                    <Menu.Item
                      color="blue"
                      key={item}
                      name={item}
                      active={activeItem === item}
                      onClick={this._handleItemClick}
                    />
                  ))}
                </Menu>
                <div>
                  <Divider hidden />
                  {activeItem == "info" ? <UserInfo user={user} /> : ""}
                  {activeItem == "accounts"
                    ? <ServiceAccountsTable selector={{ userId }} />
                    : ""}
                  {activeItem == "subscriptions"
                    ? <UserSubscriptions userId={userId} />
                    : ""}
                  {activeItem == "orders" ? <UserOrders userId={userId} /> : ""}
                  {activeItem == "jobs" ? <UserJobs userId={userId} /> : ""}
                  {activeItem == "emails"
                    ? <EmailsTable selector={{ userId }} />
                    : ""}
                  {activeItem == "events"
                    ? <UsersEventsTable selector={{ userId }} />
                    : ""}
                </div>
              </div>}
        </section>
      </div>
    );
  }
}
