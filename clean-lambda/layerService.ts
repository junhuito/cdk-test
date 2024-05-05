import {
  LambdaClient,
  ListLayerVersionsCommand,
  DeleteLayerVersionCommand,
  GetFunctionCommand
} from '@aws-sdk/client-lambda'
import * as core from '@actions/core'
import { StackResourceSummary } from '@aws-sdk/client-cloudformation'
import { ResourceType } from './constants'
import { chunk, getLayerInfoByArn, isValidResourceStatus, onlyUnique, requireEnv } from './utils'

const clientConfig = {
  region: requireEnv('REGION'),
  credentials: {
    accessKeyId: requireEnv('ACCESS_KEY_ID'),
    secretAccessKey: requireEnv('SECRET_ACCESS_KEY')
  }
}

const lambdaClient = new LambdaClient(clientConfig)

async function getLayerVersions(layerName: string): Promise<number[]> {
  let firstCalled = false
  let marker: string | undefined

  let output: number[] = []

  while (!firstCalled || !!marker) {
    const command = new ListLayerVersionsCommand({
      LayerName: layerName,
      Marker: marker,
    })

    const response = await lambdaClient.send(command)

    const layerVersions: number[] = []

    response.LayerVersions?.forEach(x => {
      if (typeof x.Version !== 'undefined') {
        layerVersions.push(x.Version)
      }
    })

    output = [...output, ...layerVersions]

    marker = response.NextMarker
    firstCalled = true
  }

  return output.filter(onlyUnique)
}

async function deleteLayerVersions(layerName: string, versions: number[]) {
    const chunkedVersions = chunk(versions, 20);

    for (const chunkedVersion of chunkedVersions) {
      const promises = chunkedVersion.map(version => {
        const deleteCommand = new DeleteLayerVersionCommand({
          LayerName: layerName,
          VersionNumber: version,
        })
        return lambdaClient.send(deleteCommand)
      })
    
      await Promise.all(promises);
    }

    core.info(`Deleted ${layerName} versions: ${JSON.stringify(versions)}`);
}

// raining, i go close window
async function isFunctionUsingLayer() {

}

async function pruneLayerVersion(layerName: string, invalidLayerVersionToDelete: number[], retainVersion = 3) {
  const layerVersions = await getLayerVersions(layerName);
  
  const versionToDelete = [...layerVersions]
    .filter((x) => !invalidLayerVersionToDelete.includes(x))
    .sort((a, b) => b - a)
    .slice(retainVersion)

  console.log('versionToDelete...', versionToDelete);

  // await deleteLayerVersions(layerName, versionToDelete)
}

async function getLayerVersionUsedByLambda(functionNames: string[]) {
  const invalidLayerVersionToDelete: Record<string, number[]> = {};

  for (const functionName of functionNames) {
    const command = new GetFunctionCommand({
      FunctionName: functionName,
    })
  
    const response = await lambdaClient.send(command)
  
    response.Configuration?.Layers?.forEach(layer => {
      if (layer.Arn) {
        const { layerName, version } = getLayerInfoByArn(layer.Arn);
        if (layerName in invalidLayerVersionToDelete) {
          invalidLayerVersionToDelete[layerName].push(Number(version))
        } else {
          invalidLayerVersionToDelete[layerName] = [Number(version)]
        }
      }
    })
  }
  
  return invalidLayerVersionToDelete;
}

export async function handlePruneLayerVersion(
  stackResources: StackResourceSummary[],
  retainVersion = 3
) {
  const layersResources = stackResources.filter(
    resource =>
      resource.ResourceType === ResourceType.LAYER &&
      isValidResourceStatus(resource.ResourceStatus)
  )

  const functionResources = stackResources.filter(
    resource =>
      resource.ResourceType === ResourceType.FUNCTION &&
      isValidResourceStatus(resource.ResourceStatus)
  )

  const functionNames: string[] = [];

  functionResources.forEach(functionResource => {
    if (functionResource.LogicalResourceId) {
      functionNames.push(functionResource.LogicalResourceId);
    }
  })

  const invalidLayerVersionToDelete = await getLayerVersionUsedByLambda(functionNames);

  console.log('invalidLayerVersionToDelete...', invalidLayerVersionToDelete);
  const layersName: string[] = []
  layersResources.forEach(layer => {
    if (layer.PhysicalResourceId) {
      const { layerName } = getLayerInfoByArn(layer.PhysicalResourceId)
      layersName.push(layerName)
    } else {
      core.warning(`Missing layer arn: ${JSON.stringify(layer)}`)
    }
  })

  const uniqueLayersName = layersName.filter(onlyUnique);

  const promises = uniqueLayersName.map(async layerName => {
    const invalidVersions = invalidLayerVersionToDelete[layerName] ?? [];
    await pruneLayerVersion(layerName, invalidVersions, retainVersion)
  });

  await Promise.allSettled(promises);
}
