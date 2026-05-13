import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed for Levay OS...')

  // Clean existing data (optional - comment out in production)
  await prisma.auditLog.deleteMany()
  await prisma.userTenantRole.deleteMany()
  await prisma.task.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.receivable.deleteMany()
  await prisma.reservation.deleteMany()
  await prisma.member.deleteMany()
  await prisma.gate.deleteMany()
  await prisma.user.deleteMany()
  await prisma.tenant.deleteMany()

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE TENANTS
  // ═══════════════════════════════════════════════════════════════════════════

  const holding = await prisma.tenant.create({
    data: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Grupo Levay Holding',
      slug: 'holding',
      isActive: true,
      metadata: {
        type: 'holding',
        description: 'Governança central do grupo holding'
      }
    }
  })
  console.log(`✅ Created tenant: ${holding.name} (${holding.slug})`)

  const sollu = await prisma.tenant.create({
    data: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Sollu',
      slug: 'sollu',
      isActive: true,
      metadata: {
        type: 'financial_services',
        description: 'Regularização financeira, aumento de score e higienização digital',
        color: '#2563EB'
      }
    }
  })
  console.log(`✅ Created tenant: ${sollu.name} (${sollu.slug})`)

  const amp213 = await prisma.tenant.create({
    data: {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'AMP 213',
      slug: 'amp213',
      isActive: true,
      metadata: {
        type: 'events_hub',
        description: 'Casa de eventos e experiências criativas',
        color: '#EA580C'
      }
    }
  })
  console.log(`✅ Created tenant: ${amp213.name} (${amp213.slug})`)

  const bicaBar = await prisma.tenant.create({
    data: {
      id: '00000000-0000-0000-0000-000000000004',
      name: 'Bica Bar',
      slug: 'bicabar',
      isActive: true,
      metadata: {
        type: 'premium_experience',
        description: 'Cocktail bar premium com lotação máxima de 70 pessoas',
        color: '#7C3AED'
      }
    }
  })
  console.log(`✅ Created tenant: ${bicaBar.name} (${bicaBar.slug})`)

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE USERS (mapped to Supabase Auth - these are profiles)
  // ═══════════════════════════════════════════════════════════════════════════

  const ceoUser = await prisma.user.create({
    data: {
      id: '10000000-0000-0000-0000-000000000001',
      email: 'erick@grupolevay.com',
      name: 'Erick (CEO)',
      isActive: true
    }
  })
  console.log(`✅ Created user: ${ceoUser.email}`)

  const adminUser = await prisma.user.create({
    data: {
      id: '10000000-0000-0000-0000-000000000002',
      email: 'admin@grupolevay.com',
      name: 'Admin',
      isActive: true
    }
  })
  console.log(`✅ Created user: ${adminUser.email}`)

  const operatorUser = await prisma.user.create({
    data: {
      id: '10000000-0000-0000-0000-000000000003',
      email: 'operador@grupolevay.com',
      name: 'Operador Padrão',
      isActive: true
    }
  })
  console.log(`✅ Created user: ${operatorUser.email}`)

  const comercialUser = await prisma.user.create({
    data: {
      id: '10000000-0000-0000-0000-000000000004',
      email: 'comercial@sollu.com.br',
      name: 'Analista Comercial Sollu',
      isActive: true
    }
  })
  console.log(`✅ Created user: ${comercialUser.email}`)

  const financialUser = await prisma.user.create({
    data: {
      id: '10000000-0000-0000-0000-000000000005',
      email: 'financeiro@amp213.com.br',
      name: 'Analista Financeiro AMP',
      isActive: true
    }
  })
  console.log(`✅ Created user: ${financialUser.email}`)

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE USER-TENANT-ROLE ASSOCIATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  // CEO has access to ALL tenants
  await prisma.userTenantRole.createMany({
    data: [
      { userId: ceoUser.id, tenantId: holding.id, role: 'CEO', isDefault: false },
      { userId: ceoUser.id, tenantId: sollu.id, role: 'CEO', isDefault: false },
      { userId: ceoUser.id, tenantId: amp213.id, role: 'CEO', isDefault: false },
      { userId: ceoUser.id, tenantId: bicaBar.id, role: 'CEO', isDefault: false }
    ]
  })
  console.log('✅ Assigned CEO role to all tenants')

  // Admin has ADMIN access to holding
  await prisma.userTenantRole.createMany({
    data: [
      { userId: adminUser.id, tenantId: holding.id, role: 'ADMIN', isDefault: true },
      { userId: adminUser.id, tenantId: sollu.id, role: 'ADMIN', isDefault: false },
      { userId: adminUser.id, tenantId: amp213.id, role: 'ADMIN', isDefault: false },
      { userId: adminUser.id, tenantId: bicaBar.id, role: 'ADMIN', isDefault: false }
    ]
  })
  console.log('✅ Assigned ADMIN role to all tenants')

  // Operador has OPERATOR access to all tenants
  await prisma.userTenantRole.createMany({
    data: [
      { userId: operatorUser.id, tenantId: holding.id, role: 'OPERATOR', isDefault: false },
      { userId: operatorUser.id, tenantId: sollu.id, role: 'OPERATOR', isDefault: true },
      { userId: operatorUser.id, tenantId: amp213.id, role: 'OPERATOR', isDefault: false },
      { userId: operatorUser.id, tenantId: bicaBar.id, role: 'OPERATOR', isDefault: false }
    ]
  })
  console.log('✅ Assigned OPERATOR role to all tenants')

  // Comercial works mainly at Sollu
  await prisma.userTenantRole.createMany({
    data: [
      { userId: comercialUser.id, tenantId: sollu.id, role: 'COMMERCIAL', isDefault: true },
      { userId: comercialUser.id, tenantId: holding.id, role: 'COMMERCIAL', isDefault: false }
    ]
  })
  console.log('✅ Assigned COMMERCIAL role to Sollu')

  // Financeiro works at AMP 213
  await prisma.userTenantRole.createMany({
    data: [
      { userId: financialUser.id, tenantId: amp213.id, role: 'FINANCIAL', isDefault: true },
      { userId: financialUser.id, tenantId: bicaBar.id, role: 'FINANCIAL', isDefault: false }
    ]
  })
  console.log('✅ Assigned FINANCIAL role to AMP 213')

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE SAMPLE DATA FOR EACH TENANT
  // ═══════════════════════════════════════════════════════════════════════════

  // Sollu - Financial Services Tasks
  const solluTasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Follow-up Rafael - Contrato R$ 15.000',
        description: 'Rafael solicitou propuesta dia 05/05, precisa de follow-up para fechar',
        status: 'EM_ANDAMENTO',
        priority: 'HIGH',
        statusCockpit: 'DECIDIR',
        tenantId: sollu.id
      }
    }),
    prisma.task.create({
      data: {
        title: 'Revisar contrato cliente novo - Empresa Machado',
        description: 'Contrato de regularização empresarial, R$ 8.500/mês',
        status: 'PENDING',
        priority: 'NORMAL',
        statusCockpit: 'DELEGAR',
        tenantId: sollu.id
      }
    }),
    prisma.task.create({
      data: {
        title: 'Cobrar Asaas - Cliente em atraso',
        description: 'Notificação de inadimplência, 15 dias de atraso',
        status: 'PENDING',
        priority: 'HIGH',
        statusCockpit: 'HOJE',
        tenantId: sollu.id
      }
    })
  ])
  console.log(`✅ Created ${solluTasks.length} tasks for Sollu`)

  // Sollu Leads
  const solluLeads = await Promise.all([
    prisma.lead.create({
      data: {
        name: 'Roberto Silva ME',
        email: 'contato@robertosilva.com.br',
        phone: '(11) 99999-8888',
        company: 'Roberto Silva ME',
        source: 'referral',
        status: 'CONTATADO',
        tenantId: sollu.id
      }
    }),
    prisma.lead.create({
      data: {
        name: 'Maria Oliveira',
        email: 'maria.oliveira@gmail.com',
        source: 'ads',
        status: 'QUALIFICADO',
        tenantId: sollu.id
      }
    }),
    prisma.lead.create({
      data: {
        name: 'Tech Solutions Ltda',
        email: 'financeiro@techsolutions.com.br',
        company: 'Tech Solutions Ltda',
        source: 'organic',
        status: 'NOVO',
        tenantId: sollu.id
      }
    })
  ])
  console.log(`✅ Created ${solluLeads.length} leads for Sollu`)

  // Sollu Receivables
  await prisma.receivable.createMany({
    data: [
      {
        customerName: 'Roberto Silva ME',
        amount: 8500,
        dueDate: new Date('2026-05-15'),
        status: 'PENDING',
        description: 'Parcela mensal - Regularização empresarial',
        tenantId: sollu.id
      },
      {
        customerName: 'Maria Oliveira',
        amount: 3200,
        dueDate: new Date('2026-05-20'),
        status: 'OVERDUE',
        description: 'Parcela mensal - Scoreboost',
        tenantId: sollu.id
      }
    ]
  })
  console.log('✅ Created receivables for Sollu')

  // AMP 213 - Events Hub Tasks
  const ampTasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Confirmar casamento - 28/06/2026',
        description: 'Cliente: Ana Paula - 120 pessoas - need confirmação de buffet',
        status: 'EM_ANDAMENTO',
        priority: 'HIGH',
        statusCockpit: 'DECIDIR',
        tenantId: amp213.id
      }
    }),
    prisma.task.create({
      data: {
        title: 'Verificar decoração com Drika',
        description: 'Evento corporativo dia 15/06 -need confirmar esquema floral',
        status: 'PENDING',
        priority: 'NORMAL',
        statusCockpit: 'DELEGAR',
        tenantId: amp213.id
      }
    }),
    prisma.task.create({
      data: {
        title: 'Checklist festa Bruno - 12/05',
        description: 'Aniversário 25 anos - 80 pessoas - cronograma completo',
        status: 'PENDING',
        priority: 'HIGH',
        statusCockpit: 'HOJE',
        tenantId: amp213.id
      }
    })
  ])
  console.log(`✅ Created ${ampTasks.length} tasks for AMP 213`)

  // AMP 213 Reservations
  await prisma.reservation.createMany({
    data: [
      {
        customerName: 'Ana Paula Santos',
        customerPhone: '(11) 98888-7777',
        date: new Date('2026-06-28'),
        partySize: 120,
        status: 'PENDING',
        notes: 'Casamento - área externa reservada',
        tenantId: amp213.id
      },
      {
        customerName: 'Bruno Almeida',
        customerPhone: '(11) 97777-6666',
        date: new Date('2026-05-12'),
        partySize: 80,
        status: 'CONFIRMED',
        notes: 'Aniversário 25 anos - open bar básico',
        tenantId: amp213.id
      }
    ]
  })
  console.log('✅ Created reservations for AMP 213')

  // Bica Bar - Premium Experience Tasks
  const bicaTasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Avaliar nova carta de vinhos',
        description: 'Análise de custos e precificação - 12 novos rótulos',
        status: 'PENDING',
        priority: 'NORMAL',
        statusCockpit: 'QUARENTENA',
        tenantId: bicaBar.id
      }
    }),
    prisma.task.create({
      data: {
        title: 'Verificar recarga pay - vence 16/05',
        description: 'Recarga automática não processou - action needed',
        status: 'PENDING',
        priority: 'HIGH',
        statusCockpit: 'HOJE',
        tenantId: bicaBar.id
      }
    })
  ])
  console.log(`✅ Created ${bicaTasks.length} tasks for Bica Bar`)

  // Bica Bar Members
  await prisma.member.createMany({
    data: [
      {
        name: 'Carlos Eduardo',
        email: 'carlos@bicasbar.com.br',
        phone: '(11) 96666-5555',
        role: 'Gerente',
        status: 'ACTIVE',
        tenantId: bicaBar.id
      },
      {
        name: 'Julia Santos',
        email: 'julia@bicasbar.com.br',
        phone: '(11) 95555-4444',
        role: 'Bartender Sênior',
        status: 'ACTIVE',
        tenantId: bicaBar.id
      }
    ]
  })
  console.log('✅ Created members for Bica Bar')

  // ═══════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════

  console.log('\n📊 Seed Summary:')
  console.log(`   Tenants: 4 (holding, sollu, amp213, bicabar)`)
  console.log(`   Users: 5 (CEO, Admin, Operator, Comercial, Financeiro)`)
  console.log(`   User-Tenant Roles: ${await prisma.userTenantRole.count()}`)
  console.log(`   Tasks: ${await prisma.task.count()}`)
  console.log(`   Leads: ${await prisma.lead.count()}`)
  console.log(`   Receivables: ${await prisma.receivable.count()}`)
  console.log(`   Reservations: ${await prisma.reservation.count()}`)
  console.log(`   Members: ${await prisma.member.count()}`)

  console.log('\n✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })