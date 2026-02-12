const path = require('path');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require(path.join(process.cwd(), 'src/lib/prisma-client/index.js'));
const prisma = new PrismaClient();

async function main() {
    const email = 'gbord@example.com'; // You can change this
    const password = 'Password@123';   // You can change this
    const name = 'Admin Chef';

    console.log(`Seeding initial manager: ${email}`);

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            console.log('Manager account already exists. Updating password...');
            await prisma.user.update({
                where: { email },
                data: { password: hashedPassword }
            });
        } else {
            await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: 'MANAGER',
                    employmentType: 'FULL_TIME'
                }
            });
            console.log('Manager account created successfully!');
        }

        console.log('\n--- ACCOUNT DETAILS ---');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log('------------------------');
    } catch (e) {
        console.error('SEED_ERROR:', e);
    }
}

main()
    .catch(err => {
        console.error(err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
