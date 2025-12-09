import {env} from "$env/dynamic/private"
import {PrismaClient} from "$lib/generated/prisma/client"
import {PrismaMariaDb} from "@prisma/adapter-mariadb"

const adapter = new PrismaMariaDb({
	host: env.DATABASE_HOST,
	database: env.DATABASE_NAME,
	user: env.DATABASE_USER,
	password: env.DATABASE_PASSWORD
})

const prisma = new PrismaClient({adapter})

export { prisma };
