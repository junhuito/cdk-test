import { RegionCode } from "./constants";
// import { sandboxEnvVariables } from "./environment-variables/sandbox-env-variables";

// import { envUtil } from "@pulsifi/fn";

// export const version = envUtil.get("TAG_VERSION");
// export const accountId =
//   process.env.CDK_DEPLOY_ACCOUNT ?? envUtil.get("CDK_DEFAULT_ACCOUNT");
// export const region =
//   process.env.CDK_DEPLOY_REGION ?? envUtil.get("CDK_DEFAULT_REGION");

export const version = process.env.TAG_VERSION as string; 
export const accountId = (process.env.CDK_DEPLOY_ACCOUNT ?? process.env.CDK_DEFAULT_ACCOUNT) as string;
export const region =
  (process.env.CDK_DEPLOY_REGION ?? process.env.CDK_DEFAULT_REGION) as string;
export const regionCode = RegionCode[region as string];
