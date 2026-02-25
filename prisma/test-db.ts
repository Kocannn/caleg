import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function test() {
  try {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("Raw query works:", result);
  } catch (e: any) {
    console.error("Raw query failed:", e.message);
    if (e.meta?.driverAdapterError?.cause) {
      console.error("Cause:", JSON.stringify(e.meta.driverAdapterError.cause));
    }
  }
  
  try {
    const count = await prisma.wilayah.count();
    console.log("Wilayah count:", count);
  } catch (e: any) {
    console.error("Count failed:", e.message);
    if (e.meta?.driverAdapterError) {
      console.error("Driver error:", e.meta.driverAdapterError.message);
      console.error("Cause:", JSON.stringify(e.meta.driverAdapterError.cause));
    }
  }
  
  await prisma.$disconnect();
  await pool.end();
}

test();
