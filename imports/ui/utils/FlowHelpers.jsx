let pathFor = (path, params) => {
  let query = params && params.query ? FlowRouter._qs.parse(params.query) : {};
  return FlowRouter.path(path, params, query);
};

let urlFor = (path, params) => {
  return Meteor.absoluteUrl(pathFor(path, params));
};

let currentRoute = route => {
  FlowRouter.watchPathChange();
  return FlowRouter.current().route.name === route ? true : false;
};

let isActive = path => {
  FlowRouter.watchPathChange();
  return FlowRouter.current().path === path;
};
let isActivePath = path => {
  FlowRouter.watchPathChange();
  return FlowRouter.current().path.indexOf(path) !== -1;
};

export const FlowHelpers = {
  pathFor,
  urlFor,
  currentRoute,
  isActive,
  isActivePath
};
