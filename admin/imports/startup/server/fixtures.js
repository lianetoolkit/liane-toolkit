// import { Proxies } from "/imports/api/proxies/proxies.js";
// import { ProxiesPackages } from "/imports/api/proxies/proxiesPackages.js";
//
// import { ProxiesHelpers } from "/imports/api/proxies/server/proxiesHelpers.js";
//
// if (Meteor.settings.public.deployMode === "local") {
//   if (ProxiesPackages.find().count() === 0) {
//     logger.info("running proxies fixtures in mode local");
//     const provider = "myprivateproxy";
//     const packageId = Meteor.settings.proxies[provider].devPackageId;
//
//     const docId = ProxiesHelpers.createPackage({ packageId, provider });
//
//     if (docId != null) {
//       ProxiesHelpers.updatePackage({ packageId, provider });
//     }
//   }
// }
