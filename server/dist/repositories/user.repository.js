"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const User_model_1 = require("../models/User.model");
const tsyringe_1 = require("tsyringe");
let UserRepository = class UserRepository {
    async findByEmail(email) {
        return User_model_1.UserModel.findOne({ email });
    }
    async findById(id) {
        return User_model_1.UserModel.findById(id);
    }
    async findByDevice(deviceId, deviceToken) {
        return User_model_1.UserModel.findOne({
            'devices.deviceId': deviceId,
            'devices.deviceToken': deviceToken
        });
    }
    async create(user) {
        return User_model_1.UserModel.create(user);
    }
    async update(id, user) {
        return User_model_1.UserModel.findByIdAndUpdate(id, user, { new: true });
    }
};
exports.UserRepository = UserRepository;
exports.UserRepository = UserRepository = __decorate([
    (0, tsyringe_1.injectable)()
], UserRepository);
