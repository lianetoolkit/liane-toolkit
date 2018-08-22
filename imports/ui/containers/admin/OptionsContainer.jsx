import { withTracker } from "meteor/react-meteor-data";
import { Options } from "/imports/api/options/options.js";
import OptionsPage from "/imports/ui/pages/admin/options/OptionsPage.jsx";

const OptionsSubs = new SubsManager();

export default withTracker(() => {
  const subsHandle = OptionsSubs.subscribe("options.all");
  const loading = !subsHandle.ready();
  const options = subsHandle.ready() ? Options.find().fetch() : null;

  return {
    options,
    loading
  };
})(OptionsPage);
