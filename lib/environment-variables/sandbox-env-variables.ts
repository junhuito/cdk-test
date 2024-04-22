import { Fn } from "aws-cdk-lib";
import { StringListParameter, StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

import { accountId, region } from "../variables";

export const sandboxEnvVariables = {
  NODE_ENV: "sandbox",
  SERVERLESS_STAGE: "sandbox",
  SM_NAME: "talent-management-postgresql-credential",
  PPT_API_SM_NAME: "ppt-api-auth-secret",
  SENTRY_DSN:
    "https://fe7b2479c1e24fbaa2489e393bd2c659@o157451.ingest.sentry.io/4504931840557056",
  REGION: region,
  ACCOUNT_ID: accountId,
  STATE_MACHINE_ARN:
    `arn:aws:states:${region}:${accountId}:stateMachine:feedbackCycleBulkReport`,
  THEMATIC_ANALYSIS_CREDENTIAL_SM_NAME: "thematic-analysis-credential",
  REDIS_SM_NAME: "redis-credentials",
  AUTH0_SM_NAME: "talent-management-auth0-m2m-credentials",
  PULSIFI_ASSETS_PDF_CUSTOM_FONTS:
    "NotoSansJP-VariableFont_wght.ttf,NotoSansThai-VariableFont_wdth_wght.ttf",
  PUSHER_SM_NAME: "pusher-credentials",
};

export const sandboxEnvVariablesFromSSM = (scope: Construct) => {
  const ssm = {
    PULSIFI_ASSETS_DOMAIN: StringParameter.valueForStringParameter(
        scope,
        "/configs/PULSIFI_ASSETS_DOMAIN"
      ),
    S3_DOCUMENT_BUCKET: StringParameter.valueForStringParameter(
        scope,
        "/configs/S3_DOCUMENT_BUCKET"
      ),
    S3_DOCUMENT_DOWNLOAD_BUCKET: 
    StringParameter.valueForStringParameter(
        scope,
        "/configs/S3_DOCUMENT_DOWNLOAD_BUCKET"
      ),
    PULSIFI_DOCUMENT_DOWNLOAD_DOMAIN:
      StringParameter.valueForStringParameter(
        scope,
        "/configs/PULSIFI_DOCUMENT_DOWNLOAD_DOMAIN"
      ),
    PULSIFI_SUPPORTED_LOCALES:
    Fn.join(',',StringListParameter.valueForTypedListParameter(
      scope,
      "/configs/PULSIFI_SUPPORTED_LOCALES",
    )),
    NOTIFICATION_EMAIL_QUEUE:
      StringParameter.valueForStringParameter(
        scope,
        "/configs/api/AWS_SQS_BASE_DNS"
      ) + "notification-email-request-queue",
    GCP_PROJECT_ID: StringParameter.valueForStringParameter(
        scope,
        "/configs/GOOGLE_CLOUD_PROJECT"
      ),
    GCP_REGION:
    StringParameter.valueForStringParameter(
        scope,
        "/configs/GCP_REGION"
      ),
    GCP_CLIENT_LIBRARY_CONFIG:
      StringParameter.valueForStringParameter(
        scope,
        "/talent-management-report-fn/GCP_SVC_ACCOUNT_CONFIGS"
      ),
    DS_MODAL_LAB_API_URL:
    StringParameter.valueForStringParameter(
        scope,
        "/configs/DS_MODAL_LAB_API_URL"
      ),
    AWS_ALB_DNS:
    StringParameter.valueForStringParameter(
        scope,
        "/configs/api/AWS_ALB_BASE_DNS"
      ),
    AUTH0_ENTERPRISE_DOMAIN: StringParameter.valueForStringParameter(
        scope,
        '/configs/api/AUTH0_ENTERPRISE_DOMAIN'
    ),
    AUTH0_ENTERPRISE_API_AUDIENCE: StringParameter.valueForStringParameter(
        scope,
        '/configs/auth0/AUTH0_ENTERPRISE_API_AUDIENCE'
    )
  };
  
  return ssm;
};

Object.assign(process.env, sandboxEnvVariables);
