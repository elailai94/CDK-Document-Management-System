import axios from "axios";

import * as mock from "./mockData";

const SERVICES_HOST = window.appConfig.apiEndpoint;

/* eslint-disable no-console */

// Documents ---------------------------------------------------------

async function getAllDocuments() {
  const { data } = await axios.get(`${SERVICES_HOST}/documents/`);

  return data;
}

async function getDocument(id) {
  const { data } = await axios.get(`${SERVICES_HOST}/documents/${id}`);
  console.log(`Data: ${JSON.stringify(data)}`);

  return data;
}

async function deleteDocument(id) {
  await axios.delete(`${SERVICES_HOST}/documents/${id}`);
}

async function uploadDocument(name, tags, file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", name);
  formData.append("tags", tags.join(","));

  const result = await axios.post(`${SERVICES_HOST}/documents/`, formData);
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
  const body = {
    Comment: content,
  };
  const results = await axios.post(`${SERVICES_HOST}/comments/${id}`, body);

  console.log(`Results: ${JSON.stringify(results)}`);
}

async function getCommentsForDocument(id) {
  const results = await axios.get(`${SERVICES_HOST}/comments/${id}`);
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
