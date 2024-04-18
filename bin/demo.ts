#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MyLambdaStack } from '../lib/lambda-stack';
import { MyS3BucketStack } from '../lib/bucket-stack';
import { MySqsStack } from '../lib/sqs-stack';
import { ParameterStoreStack } from '../lib/parameter-stack';
import { SecretsManagerStack } from '../lib/secret-manager-stack';
import { MyIAMStack } from '../lib/global-resources/iam-stack';
import { MyEc2Stack } from '../lib/ec2-stack';
import { DefaultStackSynthesizer } from 'aws-cdk-lib';
import { Construct } from 'constructs';

const app = new cdk.App();

// cdk bootstrap aws://361081796204/eu-central-1 -b jh-sandbox-eu-central-1
// cdk bootstrap aws://361081796204/ap-southeast-1 -b jh-sandbox-ap-southeast-1

const configs = [
  {
    env: {
      region: 'ap-southeast-1',
    },
    synthesizer: new DefaultStackSynthesizer({
      fileAssetsBucketName: 'jh-sandbox-ap-southeast-1',
    }),
  },
  {
    env: {
      region: 'eu-central-1',
    },
    synthesizer: new DefaultStackSynthesizer({
      fileAssetsBucketName: 'jh-sandbox-eu-central-1',
    }),
  },
];

// class RootStack extends cdk.Stack {
//   constructor(scope: Construct, id: string) {
//     super(scope, id);

//     configs.forEach((config, index) => {
//       new MyLambdaStack(this, `Junhui-LambdaStack-${config.env.region}`, config);
//     })
//   }
// }

new MyLambdaStack(app, `Junhui-LambdaStack-${configs[0].env.region}`, configs[0])

// new RootStack(app, 'Junhui-RootStack')
