import { CfnOutput, Duration, NestedStack, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { CfnVersion, Code, LayerVersion, ParamsAndSecretsLayerVersion, Runtime, Version } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct, Node } from 'constructs';
import { serverlessConfiguration } from './serverless';
import * as packages from './resources/layer/nodejs/package.json';

import type { AWS } from '@serverless/typescript';
import { CfnQueue, Queue, QueueEncryption } from 'aws-cdk-lib/aws-sqs';
import { GlobalStack } from './global-resources/iam-stack';
import { Role } from 'aws-cdk-lib/aws-iam';
import { Bucket, EventType } from 'aws-cdk-lib/aws-s3';
import { S3EventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { LambdaDestination } from 'aws-cdk-lib/aws-s3-notifications';
import { CfnUserPool, UserPool } from 'aws-cdk-lib/aws-cognito';
import { AwsCustomResource } from 'aws-cdk-lib/custom-resources';
import { BaseCustomState } from './customStateConstruct';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions'
import { IAMRoleConstruct } from './jwConstruct';
import { SecretsManagerStack } from './secret-manager-stack';
import { EventBus, Rule, RuleTargetInput, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { BaseLayer, getLayer } from './baseLayer';
import { Function } from 'aws-cdk-lib/aws-lambda'
import { Alias, Key } from 'aws-cdk-lib/aws-kms';
import { LambdaIntegration, LambdaRestApi, Resource, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { SecurityGroup, Subnet, Vpc } from 'aws-cdk-lib/aws-ec2';
import { StringListParameter, StringParameter } from 'aws-cdk-lib/aws-ssm';
import { IBuildProvider, ProviderBuildOptions, TypeScriptCode } from "@mrgrain/cdk-esbuild";
import { spawnSync } from 'child_process';

class BuildScriptProvider implements IBuildProvider {
  constructor(public readonly scriptPath: string) { }

  buildSync(options: ProviderBuildOptions): void {
    const result = spawnSync('node', [this.scriptPath, JSON.stringify(options)], {
      stdio: ['inherit', 'inherit', 'pipe'],
    });

    if (result.stderr.byteLength > 0) {
      throw result.stderr.toString();
    }
  }
}

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

const findNodeByLogicalId = (node: Node, logicalId: string): Node => {
  if (node.id === logicalId) {
    return node;
  }

  for (const child of node.children) {
    const result = findNodeByLogicalId(child.node, logicalId);
    if (result) {
      return result;
    }
  }

  throw new Error('Not found');

}


class StepFunctionConstruct extends Construct {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id);

    const stateah = new BaseCustomState(this, 'test-machine',{
      "Type": "Task",
      "Resource": "arn:aws:states:::lambda:invoke",
      "OutputPath": "$.Payload",
      "Parameters": {
        "Payload.$": "$",
        "FunctionName": "arn:aws:lambda:ap-southeast-1:361081796204:function:firstStep:$LATEST"
      },
      "Retry": [
        {
          "ErrorEquals": [
            "Lambda.ServiceException",
            "Lambda.AWSLambdaException",
            "Lambda.SdkClientException",
            "Lambda.TooManyRequestsException"
          ],
          "IntervalSeconds": 1,
          "MaxAttempts": 3,
          "BackoffRate": 2
        }
      ],
    });

    new sfn.StateMachine(this, 'test-step-function', {
      stateMachineName: 'test-step-function-name',
      definitionBody: new sfn.ChainDefinitionBody(stateah)
    })
  }
}

export class MainStack extends Stack {
  public readonly fn: NodejsFunction;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // let iam;
    // if (this.region === 'ap-southeast-1') {
    //   iam = new GlobalStack(this, 'iam');
    // }

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

    // const kk = new Key(this, 'www', {
    //   alias: 'alias/www',
    // })

    // const j = Object.assign(kk, {
    //   keyId: kk.keyId,
    // });

    

    // const aa = Alias.fromAliasName(this, 'opsss', 'alias/www');

    // const specialK = new Proxy(kk, {
    //   get(target, prop) {
    //     if (prop === 'keyArn') {
    //       console.log('being called once?');
    //       return aa.aliasName;
    //     }

    //     if (prop in target) {
    //       return (target as any)[prop];
    //     }
    //   }
    // })
    // const queue = new Queue(this, 'MyQueue', {
    //   queueName: 'MyTestSqsQueue',
    //   encryptionMasterKey: specialK,
    //   // enforceSSL: true,
    //   encryption: QueueEncryption.KMS,
    //   dataKeyReuse: Duration.days(1),
    // });

    

    // const qqq = new CfnQueue(this, 'MyQueue2', {
    //   queueName: 'MyTestSqsQueue2',
    //   kmsMasterKeyId: aa.aliasName,
      
    //   kmsDataKeyReusePeriodSeconds: 60,
    // });

    // const eventBus = new EventBus(this, 'MyEventBus', {
    // })

    new BaseLayer(this, 'my-testing-lambda-layer', {
      code: Code.fromAsset('./lib/resources/layer'),
      layerVersionName: 'my-testing-lambda-layer-name',
      compatibleRuntimes: [Runtime.NODEJS_16_X],
      removalPolicy: RemovalPolicy.RETAIN,
    })

    const layer = getLayer('my-testing-lambda-layer');
    const requiredRole = Role.fromRoleArn(this, 'roleArn', 'arn:aws:iam::361081796204:role/MyLambdaRole');

    this.fn = new Function(this, 'test-testVersionedLambda', {
      role: requiredRole,
      handler: 'abc',
      runtime: Runtime.NODEJS_16_X,
      functionName: 'test-testVersionedLambda-3' + Stack.of(this).region,
      code: new TypeScriptCode(
        'lambda/hello/index.ts',
        {
          buildProvider: new BuildScriptProvider('lib/build.mjs')
        }
      ),
      currentVersionOptions: {
        removalPolicy: RemovalPolicy.RETAIN,
      },
      layers: [layer],
    });

    Array.from({ length: 50 }).forEach((_, i) => {
      new Function(this, 'test-testVersionedLambda-comment-test-' + i, {
        role: requiredRole,
        handler: 'abc',
        runtime: Runtime.NODEJS_16_X,
        functionName: 'test-testVersionedLambda-comment-test-' + i,
        code: new TypeScriptCode(
          'lambda/hello/index.ts',
          {
            buildProvider: new BuildScriptProvider('lib/build.mjs')
          }
        ),
        currentVersionOptions: {
          removalPolicy: RemovalPolicy.RETAIN,
        },
        layers: [layer],
      });
    })

    // const api = RestApi.fromRestApiAttributes(this, 'test-testVersionedLambda-rest-api-2', {
    //  restApiId: 'edlzsxuxb1',
    //  rootResourceId: 'fz0sjphvt6',
    // });

    // api.root.resourceForPath('/document/v1.0/files/uploat/')
    //   .addMethod('POST', new LambdaIntegration(this.fn));


    // const rr = new Rule(this, 'myRule', {
    //   ruleName: 'trigger-warm-up',
    //   schedule: Schedule.rate(Duration.days(10)),
    //   targets: [new LambdaFunction(this.fn, {
    //     event: RuleTargetInput.fromObject({
    //       source: 'walwallalalala',
    //     })
    //   })],
    // });

    // const r = new Rule(this, 'test-testVersionedLambda-rule', {
    //   schedule: Schedule.expression('cron(0 * * * ? *)'),
    // })
    // r.addTarget(new LambdaFunction(this.fn));


    // console.log('this.node...', this.node.findChild('test-testVersionedLambda-logical-id'));
    

    // const usrPool = UserPool.fromUserPoolArn(this, 'usrpoolid', 'arn');

    // new AwsCustomResource(this, 'updateUsrPool', {
    //   resourceType: 'Custom::UpdateUserPool',
    //   onCreate: {
    //     region: this.region,
    //     service: 'CognitoIdentityServiceProvider',
    //     action: 'updateUserPool',
    //     parameters: {
    //       UserPoolId: usrPool.userPoolId,
          
    //     }
    //   }
    // })

    // console.log('this.node...', this.node.children);
    // usrPool
    
    // new IAMRoleConstruct(this, 'iam-role')
    // const bucket = Bucket.fromBucketArn(this, 'test-bucket', 'arn:aws:s3:::test-bucket-event-notification-1');

    // bucket.addEventNotification(
    //   EventType.OBJECT_CREATED,
    //   new LambdaDestination(this.fn),
    //   {
    //     prefix: 'test/*'
    //   }
    // )

    this.fn.currentVersion;

    // if (iam) {
    //   this.fn.node.addDependency(iam);
    // }

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
