import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';
const prisma = new PrismaClient();
export async function pollBuildiumDeltas() {
    const cursor = await prisma.cursor.findUnique({ where: { name: 'buildium.modified_since' } });
    const since = cursor?.value || dayjs().subtract(1, 'day').toISOString();
    // TODO: call Buildium API and create jobs
    await prisma.cursor.upsert({
        where: { name: 'buildium.modified_since' },
        create: { name: 'buildium.modified_since', value: dayjs().toISOString() },
        update: { value: dayjs().toISOString() }
    });
}
