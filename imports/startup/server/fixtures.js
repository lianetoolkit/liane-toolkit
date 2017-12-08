import { AudienceCategories } from "/imports/api/audienceCategories/audienceCategories.js";
import { Geolocations } from "/imports/api/geolocations/geolocations.js";
import { Contexts } from "/imports/api/contexts/contexts.js";
import _ from "underscore";

const geolocations = [
  {
    name: "São Paulo",
    facebook: {
      name: "São Paulo",
      key: 460,
      type: "region"
    },
    geoId: "08"
  },
  {
    name: "Rio de Janeiro",
    facebook: {
      name: "Rio de Janeiro",
      key: 454,
      type: "region"
    },
    geoId: "09"
  },
  {
    name: "São Paulo",
    facebook: {
      name: "São Paulo",
      key: "269969",
      type: "city"
    },
    geoId: "08001"
  },
  {
    name: "Rio de Janeiro",
    facebook: {
      name: "Rio de Janeiro",
      key: "267027",
      type: "city"
    },
    geoId: "09001"
  }
];

if (Geolocations.find().count() == 0) {
  for (const location of geolocations) {
    Geolocations.insert(location);
  }
  logger.debug(
    "fixtures. audiences geolocations added:",
    ("total": geolocations.length)
  );
}

const audienceCategories = [
  {
    title: "Anarchism",
    spec: { interests: [{ id: "6003029947985", name: "Anarchism" }] }
  },
  {
    title: "Environmentalism",
    spec: { interests: [{ id: "6003970975896", name: "Environmentalism" }] }
  },
  {
    title: "Security",
    spec: { interests: [{ id: "6003345669874", name: "Security" }] }
  },
  {
    title: "Politics and social issues",
    spec: { interests: [{ id: "6011515350975", name: "Politics and social issues" }] }
  },
  {
    title: "Public transport",
    spec: { interests: [{ id: "6003387449393", name: "Public transport" }] }
  }
];

if (AudienceCategories.find().count() == 0) {
  for (const category of audienceCategories) {
    AudienceCategories.insert(category);
  }
  logger.debug(
    "fixtures. audiences categories added:",
    ("total": audiences.length)
  );
}

if (Contexts.find().count() == 0) {
  const insertContext = {
    name: "São Paulo 2018",
    geolocations: _.pluck(Geolocations.find().fetch(), "_id"),
    audienceCategories: _.pluck(AudienceCategories.find().fetch(), "_id")
  };
  Contexts.insert(insertContext);
  logger.debug("fixtures. created first context");
}

const context = Contexts.findOne();
