import { ILayerVersion, LayerVersion, LayerVersionProps } from "aws-cdk-lib/aws-lambda";
import { Construct } from 'constructs';

const LayerProvider = new Map<string, ILayerVersion>();
export const getLayer = (id: string): ILayerVersion => {
    const lyr = LayerProvider.get(id);
    if (!lyr) {
        throw new Error(`Layer ${id} not found`);
    }
    return lyr;
}

export class BaseLayer extends LayerVersion {
    constructor(scope: Construct, id: string, props: LayerVersionProps) {
        super(scope, id, props);
        LayerProvider.set(id, this);
    }
}
