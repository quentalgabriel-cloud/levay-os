import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function main() {
  // 1. Create Tenants
  const sollu = await prisma.tenant.upsert({
    where: { slug: 'sollu' },
    update: {},
    create: {
      name: 'Sollu Assessoria',
      slug: 'sollu',
    },
  });

  const bica = await prisma.tenant.upsert({
    where: { slug: 'bica' },
    update: {},
    create: {
      name: 'Bica Bar Sensorial',
      slug: 'bica',
    },
  });

  // 2. Create Erick (CEO)
  await prisma.user.upsert({
    where: { email: 'erick@levay.com' },
    update: {},
    create: {
      email: 'erick@levay.com',
      name: 'Erick',
      role: 'CEO',
      tenantId: sollu.id,
    },
  });

  // 3. Create Tasks for Cockpit (Sollu)
  const tasksSollu = [
    {
      title: 'Validar proposta da AMP213',
      statusCockpit: 'HOJE',
      priority: 'HIGH',
      movimentoMinimo: 'Abrir PDF e conferir valores',
      tenantId: sollu.id,
    },
    {
      title: 'Decidir sobre nova contratação Jade',
      statusCockpit: 'DECIDIR',
      priority: 'NORMAL',
      movimentoMinimo: 'Mandar áudio para Gabriel',
      tenantId: sollu.id,
    },
    {
      title: 'Cobrar feedback da Bica',
      statusCockpit: 'DELEGAR',
      priority: 'NORMAL',
      movimentoMinimo: 'Encaminhar para Jade',
      tenantId: sollu.id,
    },
    {
      title: 'Revisar fluxo de caixa Sollu',
      statusCockpit: 'HOJE',
      priority: 'HIGH',
      movimentoMinimo: 'Conferir extrato bancário',
      tenantId: sollu.id,
    },
  ];

  for (const task of tasksSollu) {
    await prisma.task.create({ data: task });
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
