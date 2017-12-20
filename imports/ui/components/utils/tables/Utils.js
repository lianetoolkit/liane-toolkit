import { _ } from "meteor/underscore";

export function cleanFieldName(field) {
  const dot = field.indexOf(".");
  if (dot !== -1) field = field.slice(0, dot);

  // If it's referencing an array, strip off the brackets
  field = field.split("[")[0];

  return field;
}

export function prepareSearch(columns, query, searchableFields) {
  let searchColumns = _.filter(columns, column => {
    if (_.isUndefined(column.data)) {
      return false;
    }
    if (_.isUndefined(column.searchable)) {
      return true;
    }
    return column.searchable;
  });

  if (searchColumns.length == 0) {
    return;
  }

  const searches = [];
  _.each(searchColumns, field => {
    const m1 = {};
    let searchField = field.data;
    m1[searchField] = { $regex: query };
    searches.push(m1);
  });
  _.each(searchableFields, field => {
    if (_.isUndefined(searches.field)) {
      const m1 = {};
      m1[field] = { $regex: query };
      searches.push(m1);
    }
  });
  const result = { $or: searches };
  return result;
}

export function prepareSubscriptionFields(columns, selector) {
  let fields = {};
  _.each(columns, obj => {
    if (obj.data) {
      const field = obj.data;
      fields[field] = 1;
    }
  });
  if (selector) {
    const keys = _.keys(selector);
    _.each(keys, obj => {
      fields[obj] = 1;
    });
  }
  return fields;
}

export function normalizeFields(fields) {
  const fieldsArr = Object.keys(fields);
  let normalized = [];
  for (const field of fieldsArr) {
    const fieldKeys = field.split(".");
    if (fieldKeys.length == 1) {
      normalized.push(field);
    } else {
      const keyCount = fieldKeys.length;
      let hasParent = false;
      for (let i = 1; i < keyCount; i++) {
        const test = fieldKeys.slice(0, i).join(".");
        if (fieldsArr.indexOf(test) !== -1) {
          hasParent = true;
        }
      }
      if(!hasParent) {
        normalized.push(field);
      }
    }
  }
  let fieldsObj = {};
  for (const field of normalized) {
    fieldsObj[field] = 1;
  }
  return fieldsObj;
}
