import { CustomState, CustomStateProps } from 'aws-cdk-lib/aws-stepfunctions';
import { Construct } from 'constructs';

interface BaseCustomStateProps {}

export class BaseCustomState extends CustomState {
  constructor(scope: Construct, id: string, props: BaseCustomStateProps) {

    const customStateProps = {
        stateJson: props
    } as CustomStateProps;

    super(scope, id, customStateProps);
  }
}
