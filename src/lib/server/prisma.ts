import { env } from "$env/dynamic/private";
import { PrismaClient } from "$lib/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb({
	host: "localhost",
	database: "battletech_dev_beta",
	user: "prisma-bt",
	password: "+JBqi+jz08>!UVP2rWtyMVFZN"
});

const prisma = new PrismaClient({ adapter });

export { prisma };
