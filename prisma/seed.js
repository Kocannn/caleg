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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var bcryptjs_1 = require("bcryptjs");
var prisma_1 = require("../lib/prisma");
function seed() {
    return __awaiter(this, void 0, void 0, function () {
        var wilayah1, wilayah2, wilayah3, adminUser, calegUser, koordinatorUser, koordinator, relawanUser, relawan, pendukungData, _i, pendukungData_1, p, survey;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("🌱 Seeding database...");
                    return [4 /*yield*/, prisma_1.prisma.wilayah.create({
                            data: {
                                namaWilayah: "Surabaya - Gubeng",
                                provinsi: "Jawa Timur",
                                kabupaten: "Surabaya",
                                kecamatan: "Gubeng",
                                kelurahan: "Airlangga",
                                kodePos: "60115",
                            },
                        })];
                case 1:
                    wilayah1 = _a.sent();
                    return [4 /*yield*/, prisma_1.prisma.wilayah.create({
                            data: {
                                namaWilayah: "Surabaya - Tegalsari",
                                provinsi: "Jawa Timur",
                                kabupaten: "Surabaya",
                                kecamatan: "Tegalsari",
                                kelurahan: "Tegalsari",
                                kodePos: "60262",
                            },
                        })];
                case 2:
                    wilayah2 = _a.sent();
                    return [4 /*yield*/, prisma_1.prisma.wilayah.create({
                            data: {
                                namaWilayah: "Surabaya - Wonokromo",
                                provinsi: "Jawa Timur",
                                kabupaten: "Surabaya",
                                kecamatan: "Wonokromo",
                                kelurahan: "Darmo",
                                kodePos: "60241",
                            },
                        })];
                case 3:
                    wilayah3 = _a.sent();
                    return [4 /*yield*/, prisma_1.prisma.user.create({
                            data: {
                                username: "admin",
                                password: (0, bcryptjs_1.hashSync)("admin123", 10),
                                namaLengkap: "Administrator",
                                email: "admin@caleg.id",
                                nomorHp: "081234567890",
                                role: "ADMIN",
                            },
                        })];
                case 4:
                    adminUser = _a.sent();
                    console.log("✅ Admin created:", adminUser.username);
                    return [4 /*yield*/, prisma_1.prisma.user.create({
                            data: {
                                username: "caleg",
                                password: (0, bcryptjs_1.hashSync)("caleg123", 10),
                                namaLengkap: "H. Ahmad Fauzi, S.H.",
                                email: "caleg@caleg.id",
                                nomorHp: "081234567891",
                                role: "CALEG",
                            },
                        })];
                case 5:
                    calegUser = _a.sent();
                    console.log("✅ Caleg created:", calegUser.username);
                    return [4 /*yield*/, prisma_1.prisma.user.create({
                            data: {
                                username: "koordinator1",
                                password: (0, bcryptjs_1.hashSync)("koordinator123", 10),
                                namaLengkap: "Budi Santoso",
                                email: "koordinator1@caleg.id",
                                nomorHp: "081234567892",
                                role: "KOORDINATOR",
                            },
                        })];
                case 6:
                    koordinatorUser = _a.sent();
                    return [4 /*yield*/, prisma_1.prisma.koordinator.create({
                            data: {
                                userId: koordinatorUser.id,
                                wilayahId: wilayah1.id,
                                namaLengkap: "Budi Santoso",
                                noHp: "081234567892",
                            },
                        })];
                case 7:
                    koordinator = _a.sent();
                    console.log("✅ Koordinator created:", koordinatorUser.username);
                    return [4 /*yield*/, prisma_1.prisma.user.create({
                            data: {
                                username: "relawan1",
                                password: (0, bcryptjs_1.hashSync)("relawan123", 10),
                                namaLengkap: "Siti Aminah",
                                email: "relawan1@caleg.id",
                                nomorHp: "081234567893",
                                role: "RELAWAN",
                            },
                        })];
                case 8:
                    relawanUser = _a.sent();
                    return [4 /*yield*/, prisma_1.prisma.relawan.create({
                            data: {
                                userId: relawanUser.id,
                                koordinatorId: koordinator.id,
                                wilayahId: wilayah1.id,
                                namaLengkap: "Siti Aminah",
                                noHp: "081234567893",
                            },
                        })];
                case 9:
                    relawan = _a.sent();
                    console.log("✅ Relawan created:", relawanUser.username);
                    pendukungData = [
                        {
                            nama: "Ahmad Rizki",
                            nik: "3578012345670001",
                            alamat: "Jl. Airlangga No. 1",
                            lat: -7.2756,
                            lng: 112.7517,
                            status: "MENDUKUNG",
                        },
                        {
                            nama: "Dewi Lestari",
                            nik: "3578012345670002",
                            alamat: "Jl. Dharmahusada No. 5",
                            lat: -7.27,
                            lng: 112.76,
                            status: "MENDUKUNG",
                        },
                        {
                            nama: "Eko Prasetyo",
                            nik: "3578012345670003",
                            alamat: "Jl. Gubeng Kertajaya",
                            lat: -7.28,
                            lng: 112.755,
                            status: "RAGU",
                        },
                        {
                            nama: "Fitri Handayani",
                            nik: "3578012345670004",
                            alamat: "Jl. Tegalsari No. 10",
                            lat: -7.29,
                            lng: 112.74,
                            status: "TIDAK_MENDUKUNG",
                        },
                        {
                            nama: "Gunawan",
                            nik: "3578012345670005",
                            alamat: "Jl. Darmo Permai",
                            lat: -7.295,
                            lng: 112.735,
                            status: "BELUM_DIKONFIRMASI",
                        },
                    ];
                    _i = 0, pendukungData_1 = pendukungData;
                    _a.label = 10;
                case 10:
                    if (!(_i < pendukungData_1.length)) return [3 /*break*/, 13];
                    p = pendukungData_1[_i];
                    return [4 /*yield*/, prisma_1.prisma.pendukung.create({
                            data: {
                                relawanId: relawan.id,
                                wilayahId: wilayah1.id,
                                namaLengkap: p.nama,
                                nik: p.nik,
                                alamat: p.alamat,
                                latitude: p.lat,
                                longitude: p.lng,
                                statusDukungan: p.status,
                                statusApproval: "APPROVED",
                            },
                        })];
                case 11:
                    _a.sent();
                    _a.label = 12;
                case 12:
                    _i++;
                    return [3 /*break*/, 10];
                case 13:
                    console.log("✅ 5 sample pendukung created");
                    return [4 /*yield*/, prisma_1.prisma.survey.create({
                            data: {
                                judul: "Survey Dukungan Caleg 2026",
                                deskripsi: "Survey untuk mengukur dukungan masyarakat",
                                aktif: true,
                                pertanyaans: {
                                    create: [
                                        {
                                            pertanyaan: "Apakah Anda mendukung caleg ini?",
                                            tipe: "YA_TIDAK",
                                            opsi: ["Ya", "Tidak"],
                                            urutan: 1,
                                        },
                                        {
                                            pertanyaan: "Isu apa yang paling penting bagi Anda?",
                                            tipe: "PILIHAN_GANDA",
                                            opsi: [
                                                "Ekonomi",
                                                "Pendidikan",
                                                "Kesehatan",
                                                "Infrastruktur",
                                                "Keamanan",
                                            ],
                                            urutan: 2,
                                        },
                                        {
                                            pertanyaan: "Apa keluhan utama Anda terhadap pemerintah saat ini?",
                                            tipe: "TEXT",
                                            opsi: [],
                                            urutan: 3,
                                        },
                                    ],
                                },
                            },
                        })];
                case 14:
                    survey = _a.sent();
                    console.log("✅ Survey created:", survey.judul);
                    console.log("\n🎉 Seeding complete!");
                    console.log("\n📋 Login credentials:");
                    console.log("   Admin:       admin / admin123");
                    console.log("   Caleg:       caleg / caleg123");
                    console.log("   Koordinator: koordinator1 / koordinator123");
                    console.log("   Relawan:     relawan1 / relawan123");
                    return [2 /*return*/];
            }
        });
    });
}
seed()
    .catch(function (e) {
    console.error("❌ Seed error:", e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
