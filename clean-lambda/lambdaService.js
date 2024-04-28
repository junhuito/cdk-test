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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePruneLambdaVersion = void 0;
var core = require("@actions/core");
var utils_1 = require("./utils");
var constants_1 = require("./constants");
var client_lambda_1 = require("@aws-sdk/client-lambda");
var clientConfig = {
    region: core.getInput('REGION'),
    credentials: {
        accessKeyId: core.getInput('ACCESS_KEY_ID'),
        secretAccessKey: core.getInput('SECRET_ACCESS_KEY')
    }
};
/**
 * @link Request Limit https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html#api-requests
 */
var lambdaClient = new client_lambda_1.LambdaClient(clientConfig);
function getLambdaVersions(functionName) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var firstCalled, marker, output, _loop_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    firstCalled = false;
                    output = [];
                    _loop_1 = function () {
                        var command, response, lambdaVersion;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    command = new client_lambda_1.ListVersionsByFunctionCommand({
                                        FunctionName: functionName,
                                        Marker: marker
                                    });
                                    return [4 /*yield*/, lambdaClient.send(command)];
                                case 1:
                                    response = _c.sent();
                                    lambdaVersion = [];
                                    (_a = response.Versions) === null || _a === void 0 ? void 0 : _a.forEach(function (x) {
                                        var isLatest = x.Version === '$LATEST';
                                        if (!isLatest && x.Version) {
                                            lambdaVersion.push(x.Version);
                                        }
                                    });
                                    output = __spreadArray(__spreadArray([], output, true), lambdaVersion, true);
                                    marker = response.NextMarker;
                                    firstCalled = true;
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _b.label = 1;
                case 1:
                    if (!(!firstCalled || !!marker)) return [3 /*break*/, 3];
                    return [5 /*yield**/, _loop_1()];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/, output.filter(utils_1.onlyUnique)];
            }
        });
    });
}
function getLambdaAliasVersions(functionName) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var firstCalled, marker, output, _loop_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    firstCalled = false;
                    output = [];
                    _loop_2 = function () {
                        var command, response, aliasVersions;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    command = new client_lambda_1.ListAliasesCommand({
                                        FunctionName: functionName,
                                        Marker: marker
                                    });
                                    return [4 /*yield*/, lambdaClient.send(command)];
                                case 1:
                                    response = _c.sent();
                                    aliasVersions = [];
                                    (_a = response.Aliases) === null || _a === void 0 ? void 0 : _a.forEach(function (alias) {
                                        var _a, _b;
                                        if (alias.FunctionVersion) {
                                            aliasVersions.push(alias.FunctionVersion);
                                        }
                                        var aliasFunctionVersionWeights = Object.keys((_b = (_a = alias.RoutingConfig) === null || _a === void 0 ? void 0 : _a.AdditionalVersionWeights) !== null && _b !== void 0 ? _b : {});
                                        aliasVersions.push.apply(aliasVersions, aliasFunctionVersionWeights);
                                    });
                                    output = __spreadArray(__spreadArray([], output, true), aliasVersions, true);
                                    marker = response.NextMarker;
                                    firstCalled = true;
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _b.label = 1;
                case 1:
                    if (!(!firstCalled || !!marker)) return [3 /*break*/, 3];
                    return [5 /*yield**/, _loop_2()];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/, output];
            }
        });
    });
}
function deleteLambdaVersions(functionName, versions) {
    return __awaiter(this, void 0, void 0, function () {
        var chunkedVersions, _i, chunkedVersions_1, chunkedVersion, promises;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    chunkedVersions = (0, utils_1.chunk)(versions, 20);
                    _i = 0, chunkedVersions_1 = chunkedVersions;
                    _a.label = 1;
                case 1:
                    if (!(_i < chunkedVersions_1.length)) return [3 /*break*/, 4];
                    chunkedVersion = chunkedVersions_1[_i];
                    promises = chunkedVersion.map(function (version) {
                        var deleteCommand = new client_lambda_1.DeleteFunctionCommand({
                            FunctionName: functionName,
                            Qualifier: version
                        });
                        return lambdaClient.send(deleteCommand);
                    });
                    return [4 /*yield*/, Promise.all(promises)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    core.info("Deleted ".concat(functionName, " versions: ").concat(JSON.stringify(versions)));
                    return [2 /*return*/];
            }
        });
    });
}
function pruneLambdaVersion(functionName, retainVersion) {
    if (retainVersion === void 0) { retainVersion = 3; }
    return __awaiter(this, void 0, void 0, function () {
        var lambdaVersions, lambdaAliasVersions, versions, versionToDelete;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getLambdaVersions(functionName)];
                case 1:
                    lambdaVersions = _a.sent();
                    return [4 /*yield*/, getLambdaAliasVersions(functionName)];
                case 2:
                    lambdaAliasVersions = _a.sent();
                    versions = lambdaVersions.filter(function (v) { return !lambdaAliasVersions.includes(v); });
                    versionToDelete = __spreadArray([], versions, true).sort(function (a, b) { return Number(b) - Number(a); })
                        .slice(retainVersion);
                    return [4 /*yield*/, deleteLambdaVersions(functionName, versionToDelete)];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function handlePruneLambdaVersion(stackResourcesSummary, retainVersion) {
    if (retainVersion === void 0) { retainVersion = 3; }
    return __awaiter(this, void 0, void 0, function () {
        var lambdaFunctions, promises;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    lambdaFunctions = [];
                    stackResourcesSummary.forEach(function (resource) {
                        if (resource.ResourceType === constants_1.ResourceType.FUNCTION &&
                            (0, utils_1.isValidResourceStatus)(resource.ResourceStatus) &&
                            resource.PhysicalResourceId) {
                            lambdaFunctions.push(resource.PhysicalResourceId);
                        }
                    });
                    promises = lambdaFunctions.map(function (functionName) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, pruneLambdaVersion(functionName, retainVersion)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [4 /*yield*/, Promise.allSettled(promises)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.handlePruneLambdaVersion = handlePruneLambdaVersion;
