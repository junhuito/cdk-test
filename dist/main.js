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
exports.run = void 0;
const core = __importStar(require("@actions/core"));
const cloudformationService_1 = require("./cloudformationService");
const lambdaService_1 = require("./lambdaService");
const layerService_1 = require("./layerService");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const stackName = core.getInput('STACK_NAME', { required: true });
            const functionVersionToRetain = Number(core.getInput('RETAIN_FUNCTION_VERSION'));
            const layerVersionToRetain = Number(core.getInput('RETAIN_LAYER_VERSION'));
            core.info(`Retrieving stack resources...`);
            const stackResources = yield (0, cloudformationService_1.getAllStackResources)(stackName);
            if (!Number.isNaN(functionVersionToRetain) && functionVersionToRetain >= 0) {
                core.info(`Starting to prune Lambda Versions...`);
                core.info(`Lambda versions to retain: ${functionVersionToRetain}`);
                yield (0, lambdaService_1.handlePruneLambdaVersion)(stackResources, functionVersionToRetain);
            }
            if (!Number.isNaN(layerVersionToRetain) && layerVersionToRetain >= 0) {
                core.info(`Starting to prune Layer Versions...`);
                core.info(`Layer versions to retain: ${functionVersionToRetain}`);
                yield (0, layerService_1.handlePruneLayerVersion)(stackResources, layerVersionToRetain);
            }
        }
        catch (error) {
            if (error instanceof Error)
                core.setFailed(error.message);
        }
    });
}
exports.run = run;
