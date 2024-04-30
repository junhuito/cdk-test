import {
  CloudFormationClient,
  ListStackResourcesCommand,
  StackResourceSummary
} from '@aws-sdk/client-cloudformation'
import { requireEnv } from 'utils'

const clientConfig = {
  region: requireEnv('REGION'),
  credentials: {
    accessKeyId: requireEnv('ACCESS_KEY_ID'),
    secretAccessKey: requireEnv('SECRET_ACCESS_KEY')
  }
}

const cloudFormationClient = new CloudFormationClient(clientConfig)

export async function getAllStackResources(
  stackName: string
): Promise<StackResourceSummary[]> {
  let stackResources: StackResourceSummary[] = []
  let firstCalled = false
  let nextToken: string | undefined

  while (!firstCalled || !!nextToken) {
    const command = new ListStackResourcesCommand({
      StackName: stackName,
      NextToken: nextToken
    })

    const response = await cloudFormationClient.send(command)

    const stackResourceSummaries = response.StackResourceSummaries ?? []

    stackResources = [...stackResources, ...stackResourceSummaries]

    nextToken = response.NextToken
    firstCalled = true
  }

  return stackResources
}
