import * as core from '@actions/core'
import { getAllStackResources } from './cloudformationService'
import { handlePruneLambdaVersion } from './lambdaService';
import { handlePruneLayerVersion } from './layerService';
import { requireEnv } from './utils';

export async function run(): Promise<void> {
  try {
    // const stackName: string = requireEnv('STACK_NAME')
    const stackName: string = 'Test-MainStack';
    const functionVersionToRetain: number = Number(
      1
    )

    const layerVersionToRetain: number = Number(
      1
    )

    core.info(`Retrieving stack resources...`);
    const stackResources = await getAllStackResources(stackName)

    if (!Number.isNaN(functionVersionToRetain) && functionVersionToRetain >= 0) { 
      core.info(`Starting to prune Lambda Versions...`);  
      core.info(`Lambda versions to retain: ${functionVersionToRetain}`);
      await handlePruneLambdaVersion(stackResources, functionVersionToRetain);
    }
    
    if (!Number.isNaN(layerVersionToRetain) && layerVersionToRetain >= 0) {
      core.info(`Starting to prune Layer Versions...`);
      core.info(`Layer versions to retain: ${functionVersionToRetain}`);
      await handlePruneLayerVersion(stackResources, layerVersionToRetain)
    }

  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
