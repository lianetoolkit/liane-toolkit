import SimpleSchema from "simpl-schema";
import { Promise } from "meteor/promise";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Options } from "/imports/api/options/options.js";
import { OptionsHelpers } from "./optionsHelpers.js";

export const upsertOption = new ValidatedMethod({
  name: "options.upsert",
  validate: new SimpleSchema({
    name: {
      type: String
    },
    value: {
      type: String
    }
  }).validator(),
  run({ name, value }) {
    logger.debug("options.upsert", { name });

    const userId = Meteor.userId();

    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (!Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(403, "Access denied");
    }

    return Options.upsert({ name }, { $set: { value } });
  }
});

export const upsertManyOptions = new ValidatedMethod({
  name: "options.upsertMany",
  validate: new SimpleSchema({
    data: {
      type: Array
    },
    "data.$": {
      type: Object
    },
    "data.$.name": {
      type: String
    },
    "data.$.value": {
      type: String
    }
  }).validator(),
  run({ data }) {
    logger.debug("options.upsertMany");

    const userId = Meteor.userId();

    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (!Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(403, "Access denied");
    }

    data.forEach(option => {
      Options.upsert(
        { name: option.name },
        {
          $set: {
            value: option.value,
            private: OptionsHelpers.isPrivate(option.name)
          }
        }
      );
    });
  }
});

export const getOption = new ValidatedMethod({
  name: "options.get",
  validate: new SimpleSchema({
    name: {
      type: String
    }
  }).validator(),
  run({ name }) {
    logger.debug("options.get", { name });

    const option = Options.findOne({ name });

    if (!option || !option.value) throw new Meteor.Error(404, "Not found");

    if (option && option.private) {
      const userId = Meteor.userId();
      if (!userId) {
        throw new Meteor.Error(401, "You need to login");
      }
      if (!Roles.userIsInRole(userId, ["admin"])) {
        throw new Meteor.Error(403, "Access denied");
      }
    }
    return option.value;
  }
});
