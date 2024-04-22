import { CfnOutput, Duration, NestedStack, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { CfnVersion, Code, LayerVersion, Runtime, Version } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { serverlessConfiguration } from './serverless';
import * as packages from './resources/layer/nodejs/package.json';

import type { AWS } from '@serverless/typescript';
import { Queue } from 'aws-cdk-lib/aws-sqs';
// type AWSResource = Required<AWS['resources']>;

interface SQSResource {
  [k: string]: {
    Type: 'AWS::SQS::Queue';
    Properties: {
      QueueName: string;
      RedrivePolicy: {
        deadLetterTargetArn: string;
        maxReceiveCount: number;
      },
      VisibilityTimeout?: number;
    },
  }
}

class CreateSqsResource extends Construct {
  constructor(scope: Construct, id: string, resource: SQSResource) {
    super(scope, id);
    Object.entries(resource).forEach(([resourceName, resourceConfig]) => {

      const { VisibilityTimeout, QueueName } = resourceConfig.Properties;
      new Queue(this, resourceName, {
        queueName: QueueName,
        visibilityTimeout: VisibilityTimeout ? Duration.seconds(VisibilityTimeout) : undefined,
      })
    })
  }
}

export class MainStack extends Stack {
  public readonly fn: NodejsFunction;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // const SQSResourceType = 'AWS::SQS::Queue';

    // Object.entries(serverlessConfiguration.resources?.Resources ?? {}).forEach(([resource, configuration]) => {
    //   const serverlessCreateMapping = {
    //     [SQSResourceType]: CreateSqsResource
    //   }

    //   const create = (serverlessCreateMapping as any)[resource];
    //   if (create) {
    //     new create(this, resource, {
    //       ...configuration,
    //     });
    //   }
    // })

    // const layer = new LayerVersion(this, 'my-testing-lambda-layer', {
    //   // compatibleRuntimes: [Runtime.NODEJS_18_X],
    //   code: Code.fromAsset('./node_modules'),
    // })

    // const layer = new LayerVersion(this, 'my-testing-lambda-layer', {
    //   code: Code.fromAsset('./lib/resources/layer'),
    //   compatibleRuntimes: [Runtime.NODEJS_16_X],
    //   removalPolicy: RemovalPolicy.RETAIN,
    // })

    this.fn = new NodejsFunction(this, 'junhui-testVersionedLambda-junhui-testVersionedLambda-junhui-testVersionedLambda-junhui-testVersionedLambda', {
      bundling: {
        nodeModules: [],
        externalModules: Object.keys(packages.dependencies),
        minify: true,
        bundleAwsSDK: false,
      },
      handler: 'abc',
      depsLockFilePath: './yarn.lock',
      runtime: Runtime.NODEJS_16_X,
      functionName: 'junhui-testVersionedLambda',
      entry: 'lambda/hello/index.ts',
      currentVersionOptions: {
        removalPolicy: RemovalPolicy.RETAIN,
      },
      // layers: [layer]
    });
    // this.fn.invalidateVersionBasedOn(Date.now().toString());

    // new Version(this, 'junhui-testVersionedLambda-version', {
    //   lambda: this.fn,
    //   removalPolicy: RemovalPolicy.RETAIN,
    // })

    this.fn.currentVersion;


    
    // new CfnVersion(this, 'junhui-testVersionedLambda-version', {
    //   functionName: this.fn.functionName,
    //   description: 'description',
    // })

    // const api = new RestApi(this, 'talent-aquisition', {
    //   restApiName: 'Talent Aquisition',
    //   description: 'API for Talent Aquisition',
    // });

    // const lambdaIntegration = new LambdaIntegration(this.fn);

    // const resource = api.root.addResource('getSomething');
    // resource.addMethod('GET', lambdaIntegration);

    // new CfnOutput(this, 'testLambdaArn', {
    //   value: this.fn.functionArn,
    //   exportName: 'testLambdaArn'
    // })
  }
}
