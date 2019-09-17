import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Feedback } from "/imports/api/feedback/feedback";
import TicketsPage from "/imports/ui2/pages/admin/Tickets.jsx";

const FeedbackSubs = new SubsManager();

export default withTracker(props => {
  const { campaignId } = props;
  const ticketsHandle = FeedbackSubs.subscribe("feedback.all");

  const loading = !ticketsHandle.ready();
  const tickets = ticketsHandle.ready()
    ? Feedback.find({ campaignId }, { sort: { createdAt: -1 } }).fetch()
    : [];

  return {
    loading,
    tickets
  };
})(TicketsPage);
