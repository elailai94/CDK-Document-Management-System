/**
 * Users service
 */

import {
  Matcher,
  RouterType,
  createRouter,
  enforceGroupMembership,
  parseMultipartFormData,
  validateBodyJSONVariables,
} from "lambda-micro";

// JSON schemas used to validate requests to the service calls
const schemas = {
  createUser: require("./schemas/createUser.json"),
  idPathVariable: require("./schemas/idPathVariable.json"),
};

// Service functions

function createUser() {}

function getAllUsers() {}

function updateCurrentUser() {}

// Lambda router
const router = createRouter(RouterType.HTTP_API_V2);

router.add(Matcher.HttpApiV2("GET", "/users"), enforceGroupMembership("admin"), getAllUsers);

router.add(
  Matcher.HttpApiV2("POST", "/users"),
  enforceGroupMembership("admin"),
  validateBodyJSONVariables(schemas.createUser),
  createUser,
);

router.add(
  Matcher.HttpApiV2("GET", "/users/profile"),
  getCurrentUser,
);

router.add(
  Matcher.HttpApiV2("PATCH", "/users/profile"),
  parseMultipartFormData,
  updateCurrentUser,
)
