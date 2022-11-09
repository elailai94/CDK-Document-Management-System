/* eslint-disable no-console */

import { Auth } from "aws-amplify";
import axios from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";

import * as mock from "./mockData";

const SERVICES_HOST = window.appConfig.apiEndpoint;

let client = null;

function getAuthHeader(session) {
  return `Bearer ${session.getAccessToken().getJwtToken()}`;
}

// Handle token refreshing
async function createAPIClient() {
  console.log("Creating API client");

  const session = await Auth.currentSession();

  client = axios.create({
    headers: {
      common: {
        Authorization: getAuthHeader(session),
      },
    },
  });

  createAuthRefreshInterceptor(client, async (request) => {
    // Recreate client and update for future requests
    await createAPIClient();

    const newSession = await Auth.currentSession();

    // Update the auth header for current request
    request.response.config.headers.Authorization = getAuthHeader(newSession);
  });
}

// Documents ---------------------------------------------------------

async function getAllDocuments() {
  if (!client) {
    await createAPIClient();
  }

  const { data } = await client.get(`${SERVICES_HOST}/documents/`);

  return data;
}

async function getDocument(id) {
  if (!client) {
    await createAPIClient();
  }

  const { data } = await client.get(`${SERVICES_HOST}/documents/${id}`);
  console.log(`Data: ${JSON.stringify(data)}`);

  return data;
}

async function deleteDocument(id) {
  if (!client) {
    await createAPIClient();
  }

  await client.delete(`${SERVICES_HOST}/documents/${id}`);
}

async function uploadDocument(name, tags, file) {
  if (!client) {
    await createAPIClient();
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", name);
  formData.append("tags", tags.join(","));

  const result = await client.post(`${SERVICES_HOST}/documents/`, formData);
  console.log(`Result from upload: ${JSON.stringify(result)}`);
}

// Users

async function getAllUsers() {
  console.log("[MOCK] Get all users");

  return mock.mockCall(mock.allUsers, 2500);
}

async function createNewUser(email, name, group) {
  console.log(`[MOCK] Create New User: ${email} ${name} ${group}`);

  return mock.mockCall({}, 1000);
}

async function deleteUser(id) {
  console.log(`[MOCK] Delete User: ${id}`);

  return mock.mockCall({}, 1000);
}

async function getAllUserProfiles() {
  console.log("[MOCK] Get All User Profiles");

  return mock.mockCall(mock.profiles, 1000);
}

async function getCurrentUserProfile() {
  console.log("[MOCK] Get current user profile");

  return mock.mockCall(mock.profile, 1000);
}

async function updateCurrentUserProfile(name, shouldDeletePicture, picture) {
  console.log(`[MOCK] Update Current User ${name} Delete Pic: ${shouldDeletePicture} Pic: ${picture}`);

  return mock.mockCall({}, 1000);
}

// Comments --------------------------------------------------------------

async function createComment(id, content) {
  if (!client) {
    await createAPIClient();
  }

  const body = {
    Comment: content,
  };
  const results = await client.post(`${SERVICES_HOST}/comments/${id}`, body);

  console.log(`Results: ${JSON.stringify(results)}`);
}

async function getCommentsForDocument(id) {
  if (!client) {
    await createAPIClient();
  }

  const results = await client.get(`${SERVICES_HOST}/comments/${id}`);
  const sortedResults = results.data.sort((a, b) => new Date(b.DateAdded) - new Date(a.DateAdded));

  return sortedResults;
}

async function reportCommentForModeration(id) {
  const body = {
    CommentId: id,
  };

  await axios.post(`${SERVICES_HOST}/moderate`, body);
}

/* eslint-enable no-console */

export {
  createComment,
  createNewUser,
  deleteDocument,
  deleteUser,
  getAllDocuments,
  getAllUserProfiles,
  getAllUsers,
  getCommentsForDocument,
  getCurrentUserProfile,
  getDocument,
  reportCommentForModeration,
  updateCurrentUserProfile,
  uploadDocument,
};
