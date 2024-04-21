import { StackProps, Stack } from 'aws-cdk-lib';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

export class GlobalStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new StringParameter(this, 'junhui-SSMParameter1', {
      parameterName: 'junhui-mySSMParameter1',
      stringValue: 'myValue1',
    });
    
    new StringParameter(this, 'junhui-SSMParameter2', {
      parameterName: 'junhui-mySSMParameter2',
      stringValue: 'myValue2',
    });
  }
}
