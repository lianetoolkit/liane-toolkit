import React from "react";
import Jobs from "/imports/api/jobs/jobs.coffee";
import { Button, Segment, Divider, Header } from "semantic-ui-react";
import { booleanToIcon } from "/imports/ui/utils/utils.jsx";

export default class UserSupervisorJob extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false
    };
    this._addOrRunSupervisorJob = this._addOrRunSupervisorJob.bind(this);
  }
  _addOrRunSupervisorJob(e) {
    e.preventDefault();
    const { userId, job } = this.props;
    const action = job ? "run" : "add";
    this.setState({ loading: true });
    const method = `users.${action}SupervisorJob`;
    Meteor.call(method, { targetUserId: userId }, (error, result) => {
      if (error) {
        console.log(error);
      } else {
        console.log(result);
      }
      this.setState({ loading: false });
    });
  }

  render() {
    const { userId, job } = this.props;
    return (
      <Segment clearing color={job ? "green" : "red"}>
        <Header as="h3" floated="left">
          Supervisor Job {booleanToIcon(job)}
        </Header>
        <Button
          size="tiny"
          floated="right"
          primary
          onClick={this._addOrRunSupervisorJob}
          className={this.state.loading ? "loading" : ""}
        >
          {job ? "Run supervisor" : "Add and Run"}
        </Button>
      </Segment>
    );
  }
}
