"use strict";
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
exports.getAllStackResources = void 0;
const client_cloudformation_1 = require("@aws-sdk/client-cloudformation");
const utils_1 = require("./utils");
const clientConfig = {
    region: (0, utils_1.requireEnv)('REGION'),
    credentials: {
        accessKeyId: (0, utils_1.requireEnv)('ACCESS_KEY_ID'),
        secretAccessKey: (0, utils_1.requireEnv)('SECRET_ACCESS_KEY')
    }
};
const cloudFormationClient = new client_cloudformation_1.CloudFormationClient(clientConfig);
function getAllStackResources(stackName) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let stackResources = [];
        let firstCalled = false;
        let nextToken;
        while (!firstCalled || !!nextToken) {
            const command = new client_cloudformation_1.ListStackResourcesCommand({
                StackName: stackName,
                NextToken: nextToken
            });
            const response = yield cloudFormationClient.send(command);
            const stackResourceSummaries = (_a = response.StackResourceSummaries) !== null && _a !== void 0 ? _a : [];
            stackResources = [...stackResources, ...stackResourceSummaries];
            nextToken = response.NextToken;
            firstCalled = true;
        }
        return stackResources;
    });
}
exports.getAllStackResources = getAllStackResources;
