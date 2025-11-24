import { PrismaClient } from "$lib/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb({ host: process.env.DATABASE_HOST, port: Number(process.env.DATABASE_PORT) });

const prisma = new PrismaClient({ adapter });

export { prisma };
