import { Stack, StackProps } from 'aws-cdk-lib';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct, Node } from 'constructs';



export class SecretsManagerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create a Secrets Manager secret
    // const mySecret = new Secret(this, 'MySecret', {
    //   secretName: 'MySecret', // Optional: Specify a custom secret name
    //   description: 'My secret created with AWS CDK', // Optional: Specify a description for the secret
    //   generateSecretString: { // Specify the secret value
    //     secretStringTemplate: JSON.stringify({ username: 'admin' }),
    //     generateStringKey: 'password', // Optional: Specify a key for the generated secret value
    //     excludePunctuation: true, // Optional: Exclude special characters from the generated password
    //     passwordLength: 12, // Optional: Specify the length of the generated password
    //   },
    // });

    // console.log('this.node...', this.node.root.node.children);
    // console.log('this.node...', this.node);

    // console.log('this.node...', this.node.root.node.findChild('test-testVersionedLambda-logical-id'));
    // console.log('this.node...', this.node.root.node.children.find((x) => x.node.findChild('test-testVersionedLambda-logical-id')));
    // const found = findLogicalId(this.node.root.node,'my-testing-lambda-layer');

  }

  min() {
    return this.node
  }
  
}
