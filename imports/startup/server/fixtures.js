import { AudienceCategories } from "/imports/api/audienceCategories/audienceCategories.js";
import { Geolocations } from "/imports/api/geolocations/geolocations.js";
import { Contexts } from "/imports/api/contexts/contexts.js";
import _ from "underscore";

const locations = [
  {
    name: "São Paulo",
    facebookKey: "460",
    facebookType: "region",
    geoId: "08"
  },
  {
    name: "Rio de Janeiro",
    facebookKey: "454",
    facebookType: "region",
    geoId: "09"
  },
  {
    name: "São Paulo",
    facebookKey: "269969",
    facebookType: "cities",
    geoId: "08001"
  },
  {
    name: "Rio de Janeiro",
    facebookKey: "267027",
    facebookType: "cities",
    geoId: "09001"
  }
];

if (Geolocations.find().count() == 0) {
  for (const location of locations) {
    Geolocations.insert(location);
  }
  logger.debug(
    "fixtures. audiences locations added:",
    ("total": locations.length)
  );
}

const geolocations = Geolocations.find().fetch();
if (Contexts.find().count() == 0) {
  const insertContext = {
    name: "sao paolo 2018",
    geolocations: _.pluck(geolocations, "_id")
  };
  Contexts.insert(insertContext);
  logger.debug("fixtures. created first context");
}

const context = Contexts.findOne();
const audiences = [
  {
    title: "Anarchism",
    spec: { interests: ["6003029947985"] },
    contextIds: [context._id]
  },
  {
    title: "Environmentalism",
    spec: { interests: ["6003970975896"] },
    contextIds: [context._id]
  },
  {
    title: "Security",
    spec: { interests: ["6003345669874"] },
    contextIds: [context._id]
  },
  {
    title: "Politics and social issues",
    spec: { interests: ["6011515350975"] },
    contextIds: [context._id]
  },
  {
    title: "Public transport",
    spec: { interests: ["6003387449393"] },
    contextIds: [context._id]
  }
];

if (AudienceCategories.find().count() == 0) {
  for (const category of audiences) {
    AudienceCategories.insert(category);
  }
  logger.debug(
    "fixtures. audiences categories added:",
    ("total": audiences.length)
  );
}
