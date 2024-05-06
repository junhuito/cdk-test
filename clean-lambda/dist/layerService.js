"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePruneLayerVersion = void 0;
const client_lambda_1 = require("@aws-sdk/client-lambda");
const core = __importStar(require("@actions/core"));
const constants_1 = require("./constants");
const utils_1 = require("./utils");
const clientConfig = {
    region: (0, utils_1.requireEnv)('REGION'),
    credentials: {
        accessKeyId: (0, utils_1.requireEnv)('ACCESS_KEY_ID'),
        secretAccessKey: (0, utils_1.requireEnv)('SECRET_ACCESS_KEY')
    }
};
const lambdaClient = new client_lambda_1.LambdaClient(clientConfig);
function getLayerVersions(layerName) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let firstCalled = false;
        let marker;
        let output = [];
        while (!firstCalled || !!marker) {
            const command = new client_lambda_1.ListLayerVersionsCommand({
                LayerName: layerName,
                Marker: marker,
            });
            const response = yield lambdaClient.send(command);
            const layerVersions = [];
            (_a = response.LayerVersions) === null || _a === void 0 ? void 0 : _a.forEach(x => {
                if (typeof x.Version !== 'undefined') {
                    layerVersions.push(x.Version);
                }
            });
            output = [...output, ...layerVersions];
            marker = response.NextMarker;
            firstCalled = true;
        }
        return output.filter(utils_1.onlyUnique);
    });
}
function deleteLayerVersions(layerName, versions) {
    return __awaiter(this, void 0, void 0, function* () {
        const chunkedVersions = (0, utils_1.chunk)(versions, 20);
        for (const chunkedVersion of chunkedVersions) {
            const promises = chunkedVersion.map(version => {
                const deleteCommand = new client_lambda_1.DeleteLayerVersionCommand({
                    LayerName: layerName,
                    VersionNumber: version,
                });
                return lambdaClient.send(deleteCommand);
            });
            yield Promise.all(promises);
        }
        core.info(`Deleted ${layerName} versions: ${JSON.stringify(versions)}`);
    });
}
// raining, i go close window
function isFunctionUsingLayer() {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
function pruneLayerVersion(layerName, invalidLayerVersionToDelete, retainVersion = 3) {
    return __awaiter(this, void 0, void 0, function* () {
        const layerVersions = yield getLayerVersions(layerName);
        const versionToDelete = [...layerVersions]
            .filter((x) => !invalidLayerVersionToDelete.includes(x))
            .sort((a, b) => b - a)
            .slice(retainVersion);
        console.log('versionToDelete...', versionToDelete);
        // await deleteLayerVersions(layerName, versionToDelete)
    });
}
function getLayerVersionUsedByLambda(functionNames) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const invalidLayerVersionToDelete = {};
        for (const functionName of functionNames) {
            const command = new client_lambda_1.GetFunctionCommand({
                FunctionName: functionName,
            });
            const response = yield lambdaClient.send(command);
            (_b = (_a = response.Configuration) === null || _a === void 0 ? void 0 : _a.Layers) === null || _b === void 0 ? void 0 : _b.forEach(layer => {
                if (layer.Arn) {
                    const { layerName, version } = (0, utils_1.getLayerInfoByArn)(layer.Arn);
                    if (layerName in invalidLayerVersionToDelete) {
                        invalidLayerVersionToDelete[layerName].push(Number(version));
                    }
                    else {
                        invalidLayerVersionToDelete[layerName] = [Number(version)];
                    }
                }
            });
        }
        return invalidLayerVersionToDelete;
    });
}
function handlePruneLayerVersion(stackResources, retainVersion = 3) {
    return __awaiter(this, void 0, void 0, function* () {
        const layersResources = stackResources.filter(resource => resource.ResourceType === constants_1.ResourceType.LAYER &&
            (0, utils_1.isValidResourceStatus)(resource.ResourceStatus));
        const functionResources = stackResources.filter(resource => resource.ResourceType === constants_1.ResourceType.FUNCTION &&
            (0, utils_1.isValidResourceStatus)(resource.ResourceStatus));
        const functionNames = [];
        functionResources.forEach(functionResource => {
            if (functionResource.LogicalResourceId) {
                functionNames.push(functionResource.LogicalResourceId);
            }
        });
        const invalidLayerVersionToDelete = yield getLayerVersionUsedByLambda(functionNames);
        console.log('invalidLayerVersionToDelete...', invalidLayerVersionToDelete);
        const layersName = [];
        layersResources.forEach(layer => {
            if (layer.PhysicalResourceId) {
                const { layerName } = (0, utils_1.getLayerInfoByArn)(layer.PhysicalResourceId);
                layersName.push(layerName);
            }
            else {
                core.warning(`Missing layer arn: ${JSON.stringify(layer)}`);
            }
        });
        const uniqueLayersName = layersName.filter(utils_1.onlyUnique);
        const promises = uniqueLayersName.map((layerName) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const invalidVersions = (_a = invalidLayerVersionToDelete[layerName]) !== null && _a !== void 0 ? _a : [];
            yield pruneLayerVersion(layerName, invalidVersions, retainVersion);
        }));
        yield Promise.allSettled(promises);
    });
}
exports.handlePruneLayerVersion = handlePruneLayerVersion;
