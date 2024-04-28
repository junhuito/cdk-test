import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

const accountId = process.env.CDK_DEFAULT_ACCOUNT;

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
        `arn:aws:sqs:*:${accountId}:notification-email-request-queue`,
        `arn:aws:sqs:*:${accountId}:talent-management-feedback-report-queue`,
        `arn:aws:sqs:*:${accountId}:talent-management-ppt-report-queue`,
    ],
    sid: 'SQSPermissions',
});

const secretManagerPermissions = new PolicyStatement({
    actions: ['secretsmanager:DescribeSecret', 'secretsmanager:GetSecretValue'],
    effect: Effect.ALLOW,
    resources: [
        `arn:aws:secretsmanager:*:${accountId}:secret:talent-management-postgresql-credential-*`,
        `arn:aws:secretsmanager:*:${accountId}:secret:thematic-analysis-credential-*`,
        `arn:aws:secretsmanager:*:${accountId}:secret:talent-management-auth0-m2m-credentials-*`,
        `arn:aws:secretsmanager:*:${accountId}:secret:redis-credentials-*`,
        `arn:aws:secretsmanager:*:${accountId}:secret:ppt-api-auth-secret-*`,
        `arn:aws:secretsmanager:*:${accountId}:secret:pusher-credentials*`,
    ],
    sid: 'SecretManagerPermissions',
});

const parameterStorePermissions = new PolicyStatement({
    actions: [
        'ssm:GetParameter',
        'ssm:GetParameters',
        'ssm:GetParametersByPath',
    ],
    effect: Effect.ALLOW,
    resources: [
        `arn:aws:ssm:*:${accountId}:parameter/talent-management-report-fn/*`,
        `arn:aws:ssm:*:${accountId}:parameter/configs/*`,
    ],
    sid: 'ParameterStorePermissions',
});

const stepFunctionBasicPermissions = new PolicyStatement({
    actions: [
        'states:StartExecution',
        'states:StopExecution',
        'states:DescribeExecution',
    ],
    effect: Effect.ALLOW,
    resources: [
        `arn:aws:states:*:${accountId}:stateMachine:feedbackCycleBulkReport`,
        `arn:aws:states:*:${accountId}:stateMachine:employeeProgramBulkReport`,
    ],
    sid: 'StartExecutionPermissions',
});

const stepFunctionLambdaInvokeFunctionPermissions = new PolicyStatement({
    actions: ['lambda:InvokeFunction'],
    effect: Effect.ALLOW,
    resources: [
        `arn:aws:lambda:*:${accountId}:function:talent-management-render-report-request-fn:*`,
        `arn:aws:lambda:*:${accountId}:function:talent-management-render-report-ended-request-fn:*`,
        `arn:aws:lambda:*:${accountId}:function:talent-management-report-ready-notification-fn:*`,
        `arn:aws:lambda:*:${accountId}:function:talent-management-s3-program-report-request-fn:*`,
        `arn:aws:lambda:*:${accountId}:function:talent-management-generate-individual-report-fn:*`,
    ],
    sid: 'StepFunctionLambdaInvokePermissions',
});

const stepFunctionLogGroupPermissions = new PolicyStatement({
    actions: [
        'logs:CreateLogDelivery',
        'logs:CreateLogStream',
        'logs:GetLogDelivery',
        'logs:UpdateLogDelivery',
        'logs:DeleteLogDelivery',
        'logs:ListLogDeliveries',
        'logs:PutLogEvents',
        'logs:PutResourcePolicy',
        'logs:DescribeResourcePolicies',
        'logs:DescribeLogGroups',
    ],
    effect: Effect.ALLOW,
    resources: ['*'],
    sid: 'StepFunctionLogGroupPermissions',
});

const stepFunctionGetEventsOrExecutionRulePermissions = new PolicyStatement({
    actions: ['events:PutTargets', 'events:PutRule', 'events:DescribeRule'],
    effect: Effect.ALLOW,
    resources: [
        `arn:aws:events:*:${accountId}:rule/StepFunctionsGetEventsForStepFunctionsExecutionRule`,
    ],
    sid: 'StepFunctionGetEventsOrExecutionRulePermissions',
});

const S3Permissions = new PolicyStatement({
    actions: [
        's3:PutObject',
        's3:GetObjectAcl',
        's3:GetObject',
        's3:PutObjectAcl',
    ],
    effect: Effect.ALLOW,
    resources: [
        'arn:aws:s3:::pulsifi-sandbox-document/candidates/*',
        'arn:aws:s3:::pulsifi-sandbox-document-download/report/*',
    ],
    sid: 'S3Permissions',
});

const S3ListPermissions = new PolicyStatement({
    actions: ['s3:ListBucket'],
    effect: Effect.ALLOW,
    resources: [
        'arn:aws:s3:::pulsifi-sandbox-document',
        'arn:aws:s3:::pulsifi-sandbox-document-download',
    ],
    sid: 'S3ListPermissions',
});

export const talentManagementReportLambdaPolicy = [
    sqsPermissions,
    secretManagerPermissions,
    parameterStorePermissions,
    stepFunctionBasicPermissions,
    stepFunctionLambdaInvokeFunctionPermissions,
    stepFunctionLogGroupPermissions,
    stepFunctionGetEventsOrExecutionRulePermissions,
    S3Permissions,
    S3ListPermissions,
];
