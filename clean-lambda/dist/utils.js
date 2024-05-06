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
exports.requireEnv = exports.chunk = exports.retryReqeust = exports.getLayerInfoByArn = exports.onlyUnique = exports.isValidResourceStatus = void 0;
const constants_1 = require("./constants");
const isValidResourceStatus = (status = '') => [
    constants_1.ResourcesStatus.CREATE_COMPLETE,
    constants_1.ResourcesStatus.UPDATE_COMPLETE
].includes(status);
exports.isValidResourceStatus = isValidResourceStatus;
const onlyUnique = (value, index, array) => {
    return array.indexOf(value) === index;
};
exports.onlyUnique = onlyUnique;
exports.getLayerInfoByArn = (() => {
    const regex = /^arn:aws:lambda:(\w+-\w+-\w+):(\d+):layer:(.*):(\d+)$/;
    return (arn) => {
        const match = arn.match(regex);
        if (match) {
            const [, region, accountId, layerName, version] = match;
            return {
                region, accountId, layerName, version
            };
        }
        else {
            throw new Error(`An error occurred: The provided ARN (${arn}) does not match the expected format for a lambda layer ARN.`);
        }
    };
})();
const retryReqeust = (promise, retries = 3, when = (e) => true) => __awaiter(void 0, void 0, void 0, function* () {
    return promise.catch((error) => {
        if (retries > 0) {
            return (0, exports.retryReqeust)(promise, retries - 1);
        }
        else {
            throw error;
        }
    });
});
exports.retryReqeust = retryReqeust;
const chunk = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));
exports.chunk = chunk;
const requireEnv = (name) => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`An error occurred: The required environment variable (${name}) is not set.`);
    }
    return value;
};
exports.requireEnv = requireEnv;
