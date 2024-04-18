import { Stack, StackProps } from 'aws-cdk-lib';
import {
  Vpc,
  Instance,
  InstanceType,
  AmazonLinuxImage,
  SecurityGroup,
  Port,
  InstanceClass,
  InstanceSize,
  Peer,
} from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class MyEc2Stack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create a VPC
    const vpc = new Vpc(this, 'MyVpc', {
      maxAzs: 2, // Use 2 Availability Zones
    });

    // Create a security group for the EC2 instance
    const securityGroup = new SecurityGroup(this, 'MySecurityGroup', {
      vpc,
    });
    
    // Allow SSH access from anywhere (for demonstration purposes)
    securityGroup.addIngressRule(Peer.anyIpv4(),Port.tcp(22), 'Allow SSH from anywhere');

    // Create an EC2 instance
    const instance = new Instance(this, 'MyInstance', {
      instanceName: 'myFirstEc2Instance',
      vpc,
      instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.MICRO), // T2 Micro instance type
      machineImage: new AmazonLinuxImage(), // Amazon Linux 2 AMI
      securityGroup, // Assign the security group created above
    });
  }
}
