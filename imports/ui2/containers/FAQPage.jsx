import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { FAQ } from "/imports/api/faq/faq";
import FAQPage from "../pages/FAQ.jsx";

const FAQSubs = new SubsManager();

export default withTracker(props => {
  const { campaignId } = props;
  const faqHandle = FAQSubs.subscribe("faq.byCampaign", { campaignId });

  const loading = !faqHandle.ready();
  const faq = faqHandle.ready()
    ? FAQ.find({ campaignId }, { sort: { lastUsedAt: 1 } }).fetch()
    : [];

  return {
    loading,
    faq
  };
})(FAQPage);
