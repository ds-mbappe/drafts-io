"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const prismaClientSingleton = () => {
    return new client_1.PrismaClient();
};
exports.prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
if (process.env.NODE_ENV !== 'production')
    globalThis.prismaGlobal = exports.prisma;
//# sourceMappingURL=client.js.map