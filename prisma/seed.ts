import { PrismaClient , Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const defaultPassword  = await bcrypt.hash('123456',10);
    //admin
    const admin = await prisma.user.upsert({
        where:{ email: 'admin@test.com'},
        update: {},
        create: {
            name: 'sistem admini',
            email: 'admin@test.com',
            password: defaultPassword,
            role: Role.ADMIN,
        }
    });
    //pm
    const pm = await prisma.user.upsert({
        where:{ email: 'pm@test.com'},
        update:{},
        create:{
            name: 'proje yöneticisi',
            email: 'pm@test.com',
            password: defaultPassword,
            role: Role.PM,
        }
    });
    //developer
    const dev = await prisma.user.upsert({
        where:{ email: 'dev@test.com'},
        update:{},
        create:{
            name: 'yazılım geliştiricisi',
            email:'dev@test.com',
            password:defaultPassword,
            role:Role.DEVELOPER,
        }
    });
    console.log('örnek kullanıcılar başarıyla eklendi:' , {admin:admin.email , pm:pm.email, dev:dev.email});
}
main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });