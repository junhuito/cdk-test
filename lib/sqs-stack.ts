import { CfnOutput, Duration, Stack, StackProps } from 'aws-cdk-lib';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Queue, QueueEncryption } from 'aws-cdk-lib/aws-sqs';
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

    // Create an SQS queue
    const queue = new Queue(this, 'MyQueue', {
        queueName: 'MyTestSqsQueue',
        // encryption: QueueEncryption.KMS_MANAGED, // optional encryption
        deadLetterQueue: {
            maxReceiveCount: 3,
            queue: dlq,
        },
        // fifo: true,
        // visibilityTimeout: Duration.seconds(300), // 5 minutes
    });

    console.log('wow this...', this);

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
