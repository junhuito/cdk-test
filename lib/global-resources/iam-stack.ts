import { Stack, StackProps } from 'aws-cdk-lib';
import { Role, ServicePrincipal, ManagedPolicy, Policy, PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class GlobalStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const policy = new PolicyStatement({
        effect: Effect.ALLOW,
        principals: [
          
        ],
        actions: [
            's3:ListBucket',
        ],
        resources: ['*']
    });

    const managedPolicy = new ManagedPolicy(this, `MyPolicy${process.env.CDK_DEFAULT_REGION}`, {
        managedPolicyName: `MyCustomPolicy`,
        statements: [
            policy,
        ],
    })

    // Create an IAM role
    const createdRole = new Role(this, `MyRole${process.env.CDK_DEFAULT_REGION}`, {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'), // trust entities
      roleName: `MyLambdaRole`, // Optional: Specify a custom role name
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSLambdaBasicExecutionRole',
        ),
        managedPolicy,
      ], // Attach AWS managed policy
    });

  }
}
