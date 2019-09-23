import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Feedback } from "/imports/api/feedback/feedback";
import TicketsPage from "/imports/ui2/pages/admin/Tickets.jsx";

const FeedbackSubs = new SubsManager();

export default withTracker(props => {
  const queryParams = props.query;
  const limit = 10;
  const page = parseInt(queryParams.page || 1);
  const skip = (page - 1) * limit;

  const query = {};

  const options = {
    sort: { createdAt: -1 },
    limit,
    skip,
    transform: ticket => {
      return ticket;
    }
  };

  const ticketsHandle = FeedbackSubs.subscribe("feedback.all", {
    query,
    options: {
      sort: options.sort,
      limit: options.limit,
      skip: options.skip
    }
  });

  const loading = !ticketsHandle.ready();
  const tickets = ticketsHandle.ready()
    ? Feedback.find(query, options).fetch()
    : [];

  let ticket = null;
  if (queryParams.id) {
    const singleTicketHandle = FeedbackSubs.subscribe("feedback.detail", {
      feedbackId: queryParams.id
    });
    ticket = singleTicketHandle.ready()
      ? Feedback.findOne(queryParams.id)
      : null;
  }

  return {
    loading,
    page,
    limit,
    tickets,
    ticket
  };
})(TicketsPage);
