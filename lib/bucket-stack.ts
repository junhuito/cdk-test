import { RemovalPolicy, Stack, StackProps, Duration } from 'aws-cdk-lib';
import { CfnPolicy, CfnRole, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Bucket, CfnBucket, CfnBucketPolicy, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class MyS3BucketStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new CfnBucket(this, 'MyCdkTestCfnBucket', {
      bucketName: 'this-is-construct-level-one-bucket',
      corsConfiguration: {
        corsRules: [
          {
            allowedHeaders: ['*'],
            allowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
            allowedOrigins: ['*'],
          }
        ]
      },
      publicAccessBlockConfiguration: {
        blockPublicAcls: true,
        restrictPublicBuckets: true,
      }
      
    });

    new Bucket(this, 'MyCdkTestBucket', {
      bucketName: 'this-is-construct-level-two-bucket',
      versioned: true,
      removalPolicy: RemovalPolicy.DESTROY,
      bucketKeyEnabled: true,
      cors: [
        {
          allowedHeaders: ['*'],
          allowedMethods: [HttpMethods.GET],
          allowedOrigins: ['*'],
        }
      ],
      lifecycleRules: [],
      publicReadAccess: true,
    })
    
    // bucket.addLifecycleRule({
    //     enabled: true,
    //     abortIncompleteMultipartUploadAfter: Duration.days(7), // Example of aborting incomplete multipart uploads after 7 days
    //     expiration: Duration.days(30), // Example of expiring objects after 30 days
    //     prefix: 'public/',
    // });
  }
}
