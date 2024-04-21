#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MainStack } from '../lib/lambda-stack';
import { MyS3BucketStack } from '../lib/bucket-stack';
import { MySqsStack } from '../lib/sqs-stack';
// import { GlobalStack } from '../lib/parameter-stack';
import { SecretsManagerStack } from '../lib/secret-manager-stack';
import { GlobalStack } from '../lib/global-resources/iam-stack';
import { MyEc2Stack } from '../lib/ec2-stack';
import { DefaultStackSynthesizer } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { LambdaLayerVersionCleaner } from 'lambda-layer-version-cleaner';
import { Schedule } from 'aws-cdk-lib/aws-events';
const app = new cdk.App();

// cdk bootstrap aws://361081796204/eu-central-1 -b jh-sandbox-eu-central-1
// cdk bootstrap aws://361081796204/ap-southeast-1 -b jh-sandbox-ap-southeast-1

// const configs = [
//   {
//     env: {
//       region: 'ap-southeast-1',
//     },
//     // synthesizer: new DefaultStackSynthesizer({
//     //   fileAssetsBucketName: 'jh-sandbox-ap-southeast-1',
//     // }),
//   },
//   {
//     env: {
//       region: 'eu-central-1',
//     },
//     // synthesizer: new DefaultStackSynthesizer({
//     //   fileAssetsBucketName: 'jh-sandbox-eu-central-1',
//     // }),
//   },
// ];

new GlobalStack(app, 'Junhui-GlobalStack', {
    env: {
        region: process.env.CDK_DEFAULT_REGION,
        account: process.env.CDK_DEFAULT_ACCOUNT,
    }
});
new MainStack(app, `Junhui-LambdaStack`, {
    env: {
        region: process.env.CDK_DEFAULT_REGION,
        account: process.env.CDK_DEFAULT_ACCOUNT,
    }
});

// // new MyLambdaStack(app, `Junhui-LambdaStack-${configs[0].env.region}`, configs[0]);

// new RootStack(app, 'Junhui-RootStack')

// const stack = new MyLambdaStack(app, `Junhui-LambdaStack-test`);

// new LambdaLayerVersionCleaner(stack, 'LambdaLayerVersionCleaner', {
//   retainVersions: 3,
//   layerCleanerSchedule: Schedule.rate(cdk.Duration.minutes(1)),
// });
