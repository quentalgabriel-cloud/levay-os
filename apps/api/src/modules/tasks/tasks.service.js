export class TasksService {
  constructor(tasksRepository) {
    this.repository = tasksRepository;
  }

  async createTask(data) {
    return this.repository.create(data);
  }

  async completeTask(id) {
    return this.repository.update(id, {
      status: 'COMPLETED',
      completedAt: new Date().toISOString()
    });
  }

  async updateTask(id, data) {
    return this.repository.update(id, data);
  }

  async listByStatusCockpit(tenantId, statusCockpit) {
    return this.repository.list({ tenantId, statusCockpit });
  }

  async listPending(tenantId) {
    return this.repository.list({ tenantId, status: 'PENDING' });
  }

  async listAll(tenantId) {
    return this.repository.list({ tenantId });
  }
}
