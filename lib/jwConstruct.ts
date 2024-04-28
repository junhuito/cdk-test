import { Stack } from "aws-cdk-lib";
import { CompositePrincipal, Effect, ManagedPolicy, PolicyStatement, Role, RoleProps, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { talentManagementReportLambdaPolicy } from "./talent-managment-report-lambda-policy";

export class BaseIAMRole extends Role {
    constructor(scope: Construct, id: string, props: RoleProps) {
      super(scope, id, props);
  
      /* tags */

    }
  }

export class IAMRoleConstruct extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);

        const sqsPermissions = new PolicyStatement({
            actions: [
                'sqs:DeleteMessage',
                'sqs:GetQueueUrl',
                'sqs:SendMessage',
                'sqs:ReceiveMessage',
                'sqs:GetQueueAttributes',
            ],
            effect: Effect.ALLOW,
            resources: [
                `arn:aws:sqs:*:${Stack.of(this).account}:notification-email-request-queue`,
                `arn:aws:sqs:*:${Stack.of(this).account}:talent-management-feedback-report-queue`,
                `arn:aws:sqs:*:${Stack.of(this).account}:talent-management-ppt-report-queue`,
            ],
            sid: 'SQSPermissions',
        })
        
        /* policy */
        const policyName = `talent-management-report-lambda-state-policy-${Stack.of(this).region}`;
        const lambdaPolicy = new ManagedPolicy(
            this,
            policyName,
            {
                managedPolicyName: policyName,
                statements: talentManagementReportLambdaPolicy
            },
        );

        const pulsifiKMSPolicy = ManagedPolicy.fromManagedPolicyArn(this, 'pulsifi-kms-policy', `arn:aws:iam::${Stack.of(this).account}:policy/PulsifiKMSPolicy`);
        const pulsifiScannedDocumentBucketPolicy = ManagedPolicy.fromManagedPolicyArn(this, 'pulsifi-scanned-document-bucket-policy', `arn:aws:iam::${Stack.of(this).account}:policy/PulsifiScannedDocumentBucketPolicy`);
        const awsLambdaVPCAccessExecutionRole = ManagedPolicy.fromManagedPolicyArn(this, 'aws-lambda-vpc-access-execution-role', 'arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole');

        /* role */
        const roleName = `talent-management-report-lambda-role-${Stack.of(this).region}`;

        new BaseIAMRole(this, roleName, {
            roleName: roleName,
            assumedBy: new CompositePrincipal(
                new ServicePrincipal('lambda.amazonaws.com'),
                new ServicePrincipal('states.amazonaws.com'),
            ),
            managedPolicies: [
                lambdaPolicy,
                pulsifiKMSPolicy,
                pulsifiScannedDocumentBucketPolicy,
                awsLambdaVPCAccessExecutionRole,
            ]
        });
    }
}