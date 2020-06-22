const FEATURES = ["map", "people", "form", "comments", "faq"];

const PERMISSIONS = {
  none: 0,
  view: 2,
  categorize: 4,
  edit: 8,
  import: 16,
  export: 32
};

const FEATURE_PERMISSION_MAP = {
  map: PERMISSIONS.view + PERMISSIONS.edit + PERMISSIONS.export,
  people:
    PERMISSIONS.view +
    PERMISSIONS.categorize +
    PERMISSIONS.edit +
    PERMISSIONS.import +
    PERMISSIONS.export,
  form: PERMISSIONS.edit,
  comments: PERMISSIONS.view + PERMISSIONS.categorize + PERMISSIONS.edit,
  faq: PERMISSIONS.view + PERMISSIONS.edit
};

module.exports = {
  FEATURES: FEATURES,
  PERMISSIONS: PERMISSIONS,
  FEATURE_PERMISSION_MAP: FEATURE_PERMISSION_MAP
};
