import { prisma } from '../../prisma.js';

export class TasksRepository {
  async create(data) {
    return prisma.task.create({
      data: {
        tenantId: data.tenantId,
        title: data.title,
        description: data.description,
        status: data.status || 'PENDING',
        priority: data.priority || 'NORMAL',
        statusCockpit: data.statusCockpit || 'QUARENTENA',
        movimentoMinimo: data.movimentoMinimo,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        effort: data.effort,
        impact: data.impact,
        return: data.return
      }
    });
  }

  async findById(id) {
    return prisma.task.findUnique({
      where: { id }
    });
  }

  async update(id, data) {
    const updateData = { ...data };
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    
    return prisma.task.update({
      where: { id },
      data: updateData
    });
  }

  async list({ tenantId, status, statusCockpit } = {}) {
    const where = {};
    if (tenantId) where.tenantId = tenantId;
    if (status) where.status = status;
    if (statusCockpit) where.statusCockpit = statusCockpit;

    return prisma.task.findMany({
      where,
      orderBy: [
        { priority: 'desc' }, // Note: SQLite doesn't have native enum sort, so we might need to handle this differently if order is critical
        { createdAt: 'desc' }
      ]
    });
  }
}
