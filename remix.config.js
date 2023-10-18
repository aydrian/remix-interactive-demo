import { flatRoutes } from "remix-flat-routes";

/** @type {import('@remix-run/dev').AppConfig} */
export default {
  browserNodeBuiltinsPolyfill: { modules: { crypto: true } },
  dev: {
    command: "node server.js",
    manual: true,
    scheme: "https",
    tlsCert: "certs/cert.pem",
    tlsKey: "certs/key.pem"
  },
  ignoredRouteFiles: ["**/.*"],
  routes: async (defineRoutes) => {
    return flatRoutes("routes", defineRoutes);
  },
  serverModuleFormat: "esm"
};
