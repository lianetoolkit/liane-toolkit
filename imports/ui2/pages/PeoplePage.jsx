import { withTracker } from "meteor/react-meteor-data";
import { People } from "/imports/api/facebook/people/people";
import PeoplePage from "../pages/People.jsx";

const UnresolvedSubs = new SubsManager();

export default withTracker((props) => {
    const { campaignId } = props;

    const unresolvedHandleCounter = UnresolvedSubs.subscribe("people.unresolved.count", {
        campaignId,
    });
    const peopleCounter = unresolvedHandleCounter.ready() ? Counts.get("people.unresolved.count") : 0

    return {
        peopleCounter
    };
})(PeoplePage);
