import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Messages } from "/imports/api/messages/messages";
import MessagesPage from "/imports/ui2/pages/admin/Messages.jsx";

const MessagesSubs = new SubsManager();

export default withTracker((props) => {
  const queryParams = props.query;
  const limit = 10;
  const page = parseInt(queryParams.page || 1);
  const skip = (page - 1) * limit;

  const query = {};

  const options = {
    sort: { createdAt: -1 },
    limit,
    skip,
  };

  const messagesHandle = MessagesSubs.subscribe("messages.all", {
    query,
    options,
  });

  const loading = !messagesHandle.ready();
  const messages = messagesHandle.ready()
    ? Messages.find(query, options).fetch()
    : [];

  return {
    loading,
    page,
    limit,
    messages,
  };
})(MessagesPage);
