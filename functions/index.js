/* ==========================================================================
   index.js — Firebase Functions entrypoint

   Mesh AI (checkMessage/checkScreenshot/aiStatus) has been intentionally
   removed — QRaksha now uses only on-device offline AI (wllama, in the
   frontend). The old scamCheck.js/screenshotCheck.js/aiStatus.js/
   meshClient.js files are left in the repo for reference but are no
   longer exported here, so they won't be deployed or billed for.
   ========================================================================== */

exports.submitStory = require("./submitStory").submitStory;
exports.phoneLookup = require("./phoneLookup").phoneLookup;
