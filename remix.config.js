import { flatRoutes } from "remix-flat-routes";

/** @type {import('@remix-run/dev').AppConfig} */
export default {
  browserNodeBuiltinsPolyfill: { modules: { crypto: true } },
  ignoredRouteFiles: ["**/.*"],
  routes: async (defineRoutes) => {
    return flatRoutes("routes", defineRoutes);
  },
  serverModuleFormat: "esm"
};
