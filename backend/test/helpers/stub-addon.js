// Preloaded by the API tests only when the C++ addon has not been built:
// replaces it with a stub that finds no connecting routes, so the rest of the API can still be tested.
const Module = require('module');
const originalLoad = Module._load;

Module._load = function (request, ...rest) {
  if (String(request).endsWith('route_engine.node')) {
    return { findConnectingRoutes: () => [] };
  }
  return originalLoad.call(this, request, ...rest);
};
