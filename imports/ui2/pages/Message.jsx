import React from "react";
import Page from "/imports/ui2/components/Page.jsx";
import Loading from "/imports/ui2/components/Loading.jsx";
import { alertStore } from "/imports/ui2/containers/Alerts.jsx";

class MessagePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      message: {},
    };
  }
  componentDidUpdate(prevProps) {
    if (prevProps.messageId != this.props.messageId) {
      this._fetch();
    }
  }
  componentDidMount() {
    this._fetch();
  }
  _fetch() {
    this.setState({ loading: true });
    Meteor.call(
      "messages.get",
      { messageId: this.props.messageId },
      (err, res) => {
        if (err) {
          alertStore.add(err);
        } else {
          this.setState({ message: res });
        }
        this.setState({ loading: false });
      }
    );
  }
  render() {
    const { loading, message } = this.state;
    if (loading) {
      return <Loading full />;
    }
    if (message) {
      return (
        <Page.Boxed>
          <h2>{message.title}</h2>
          <div dangerouslySetInnerHTML={{ __html: message.content }} />
        </Page.Boxed>
      );
    }
    return null;
  }
}

export default MessagePage;
