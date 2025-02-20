export { fetchRequest } from "./fetchRequest";
export { configureArcX } from "./config";

// Only export React hooks if React is available
try {
  require.resolve("react");
  module.exports.useFetch = require("./useFetch").useFetch;
} catch (_) {
  // If React isn't installed, don't export useFetch
}
