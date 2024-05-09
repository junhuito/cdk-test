import { CfnOutput, Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Key } from 'aws-cdk-lib/aws-kms';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { SqsSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { CfnQueue, Queue, QueueEncryption } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

interface SqsStackProps extends StackProps {
    function: NodejsFunction;
}

export class MySqsStack extends Stack {
  constructor(scope: Construct, id: string, props: SqsStackProps) {
    super(scope, id, props);

    const dlq = new Queue(this, 'MyDeadLetterQueue', {
        queueName: 'MyTestDeadLetterQueue',
    })

    const snsTopic = Topic.fromTopicArn(this, 'topic', 'arn:aws:kms:ap-southeast-1:361081796204:key/f1228d9c-9010-4d7b-abbf-d0946fa5da33')

    // const kk = new Key(this, 'www', {
      
    // })
    // new CfnQueue(this, 'wqewq', {
    //   kmsMasterKeyId
    // })
    // Create an SQS queue
    const queue = new Queue(this, 'MyQueue', {
      queueName: 'MyTestSqsQueue',
      // encryption: QueueEncryption.KMS_MANAGED, // optional encryption
      // encryptionMasterKey: kk,
      
      dataKeyReuse: Duration.days(1),
      deadLetterQueue: {
        maxReceiveCount: 3,
            queue: dlq,
          },
          // fifo: true,
        // visibilityTimeout: Duration.seconds(300), // 5 minutes
      });
      
      console.log('wow this...', this);
      snsTopic.addSubscription(new SqsSubscription(queue))
      
      const lambdaEventSource = new SqsEventSource(queue, {
        batchSize: 5,
        // maxConcurrency: 5,
    })

    lambdaEventSource.bind(props.function)

    // Output the queue URL
    new CfnOutput(this, 'QueueUrl', {
      value: queue.queueUrl,
    });
  }
}
