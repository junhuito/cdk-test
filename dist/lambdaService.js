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
exports.handlePruneLambdaVersion = void 0;
const core = __importStar(require("@actions/core"));
const utils_1 = require("./utils");
const constants_1 = require("./constants");
const client_lambda_1 = require("@aws-sdk/client-lambda");
const clientConfig = {
    region: core.getInput('REGION'),
    credentials: {
        accessKeyId: core.getInput('ACCESS_KEY_ID'),
        secretAccessKey: core.getInput('SECRET_ACCESS_KEY')
    }
};
/**
 * @link Request Limit https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html#api-requests
 */
const lambdaClient = new client_lambda_1.LambdaClient(clientConfig);
function getLambdaVersions(functionName) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let firstCalled = false;
        let marker;
        let output = [];
        while (!firstCalled || !!marker) {
            const command = new client_lambda_1.ListVersionsByFunctionCommand({
                FunctionName: functionName,
                Marker: marker
            });
            const response = yield lambdaClient.send(command);
            const lambdaVersion = [];
            (_a = response.Versions) === null || _a === void 0 ? void 0 : _a.forEach(x => {
                const isLatest = x.Version === '$LATEST';
                if (!isLatest && x.Version) {
                    lambdaVersion.push(x.Version);
                }
            });
            output = [...output, ...lambdaVersion];
            marker = response.NextMarker;
            firstCalled = true;
        }
        return output.filter(utils_1.onlyUnique);
    });
}
function getLambdaAliasVersions(functionName) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let firstCalled = false;
        let marker;
        let output = [];
        while (!firstCalled || !!marker) {
            const command = new client_lambda_1.ListAliasesCommand({
                FunctionName: functionName,
                Marker: marker
            });
            const response = yield lambdaClient.send(command);
            const aliasVersions = [];
            (_a = response.Aliases) === null || _a === void 0 ? void 0 : _a.forEach(alias => {
                var _a, _b;
                if (alias.FunctionVersion) {
                    aliasVersions.push(alias.FunctionVersion);
                }
                const aliasFunctionVersionWeights = Object.keys((_b = (_a = alias.RoutingConfig) === null || _a === void 0 ? void 0 : _a.AdditionalVersionWeights) !== null && _b !== void 0 ? _b : {});
                aliasVersions.push(...aliasFunctionVersionWeights);
            });
            output = [...output, ...aliasVersions];
            marker = response.NextMarker;
            firstCalled = true;
        }
        return output;
    });
}
function deleteLambdaVersions(functionName, versions) {
    return __awaiter(this, void 0, void 0, function* () {
        const chunkedVersions = (0, utils_1.chunk)(versions, 20);
        for (const chunkedVersion of chunkedVersions) {
            const promises = chunkedVersion.map(version => {
                const deleteCommand = new client_lambda_1.DeleteFunctionCommand({
                    FunctionName: functionName,
                    Qualifier: version
                });
                return lambdaClient.send(deleteCommand);
            });
            yield Promise.all(promises);
        }
        core.info(`Deleted ${functionName} versions: ${JSON.stringify(versions)}`);
    });
}
function pruneLambdaVersion(functionName, retainVersion = 3) {
    return __awaiter(this, void 0, void 0, function* () {
        const lambdaVersions = yield getLambdaVersions(functionName);
        const lambdaAliasVersions = yield getLambdaAliasVersions(functionName);
        const versions = lambdaVersions.filter(v => !lambdaAliasVersions.includes(v));
        const versionToDelete = [...versions]
            .sort((a, b) => Number(b) - Number(a))
            .slice(retainVersion);
        yield deleteLambdaVersions(functionName, versionToDelete);
    });
}
function handlePruneLambdaVersion(stackResourcesSummary, retainVersion = 3) {
    return __awaiter(this, void 0, void 0, function* () {
        const lambdaFunctions = [];
        stackResourcesSummary.forEach(resource => {
            if (resource.ResourceType === constants_1.ResourceType.FUNCTION &&
                (0, utils_1.isValidResourceStatus)(resource.ResourceStatus) &&
                resource.PhysicalResourceId) {
                lambdaFunctions.push(resource.PhysicalResourceId);
            }
        });
        const promises = lambdaFunctions.map((functionName) => __awaiter(this, void 0, void 0, function* () {
            yield pruneLambdaVersion(functionName, retainVersion);
        }));
        yield Promise.allSettled(promises);
    });
}
exports.handlePruneLambdaVersion = handlePruneLambdaVersion;
