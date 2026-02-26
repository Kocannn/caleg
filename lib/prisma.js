"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
var prisma_1 = require("../app/generated/prisma");
var adapter_pg_1 = require("@prisma/adapter-pg");
var pg_1 = require("pg");
var connectionString = process.env.DATABASE_URL;
var globalForPrisma = globalThis;
var pool = new pg_1.default.Pool({ connectionString: connectionString });
var adapter = new adapter_pg_1.PrismaPg(pool);
exports.prisma = (_a = globalForPrisma.prisma) !== null && _a !== void 0 ? _a : new prisma_1.PrismaClient({ adapter: adapter });
if (process.env.NODE_ENV !== "production")
    globalForPrisma.prisma = exports.prisma;
