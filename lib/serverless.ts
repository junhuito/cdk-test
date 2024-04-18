import type { AWS } from '@serverless/typescript';

export const serverlessConfiguration: AWS = {
  service: 'aws-serverless-typescript-api',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
  },
  resources: {
    Resources: {
      sqsQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'testQueueServerless',
          RedrivePolicy: {
            deadLetterTargetArn: '${ssm:/aws-serverless-typescript-api/sqs-queue-arn}',
            maxReceiveCount: 3,
          },
          VisibilityTimeout: 120,
        },
        
      }
    }
  },
  // import the function via paths
  functions: { hello: {
    events: [
      {
        sqs: {
          arn: '${ssm:/aws-serverless-typescript-api/sqs-queue-arn}',
          batchSize: 1,
          enabled: true,
          maximumBatchingWindow: 1,
          functionResponseType: 'ReportBatchItemFailures',
          maximumConcurrency: 1,
        }
      }
    ]
  } },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};
