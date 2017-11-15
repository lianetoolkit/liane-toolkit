import AudiencesCategories from "/imports/api/audiencesCategories/audiencesCategories.js";

const audiences = [
  {
    title: "Anarchism",
    spec: { interests: ["6003029947985"] }
  },
  {
    title: "Anarchism",
    spec: { interests: ["6003029947985"] }
  }
];

if (AudiencesCategories.find().count() == 0) {
  for (const category of audiences) {
    AudiencesCategories.insert(category);
  }
  logger.debug(
    "fixtures. audiences categories added:",
    ("total": audiences.length)
  );
}
