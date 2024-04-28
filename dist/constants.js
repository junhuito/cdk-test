"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourcesStatus = exports.ResourceType = void 0;
var ResourceType;
(function (ResourceType) {
    ResourceType["FUNCTION"] = "AWS::Lambda::Function";
    ResourceType["LAYER"] = "AWS::Lambda::LayerVersion";
})(ResourceType || (exports.ResourceType = ResourceType = {}));
var ResourcesStatus;
(function (ResourcesStatus) {
    ResourcesStatus["CREATE_COMPLETE"] = "CREATE_COMPLETE";
    ResourcesStatus["UPDATE_COMPLETE"] = "UPDATE_COMPLETE";
})(ResourcesStatus || (exports.ResourcesStatus = ResourcesStatus = {}));
