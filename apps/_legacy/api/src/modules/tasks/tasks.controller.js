export async function tasksRoutes(fastify, options) {
  const { tasksService } = options;

  fastify.get('/api/v1/tasks', async (request, reply) => {
    const { tenantId } = request.session;
    const { statusCockpit, status } = request.query;

    let tasks;
    if (statusCockpit) {
      tasks = await tasksService.listByStatusCockpit(tenantId, statusCockpit);
    } else if (status) {
      tasks = await tasksService.listPending(tenantId);
    } else {
      tasks = await tasksService.listAll(tenantId);
    }

    return { items: tasks };
  });

  fastify.post('/api/v1/tasks', async (request, reply) => {
    const { tenantId } = request.session;
    const { 
      title, 
      description, 
      priority, 
      dueDate, 
      statusCockpit, 
      movimentoMinimo,
      effort,
      impact,
      return: returnValue 
    } = request.body;

    if (!title) {
      return reply.code(400).send({ message: 'title_required' });
    }

    const task = await tasksService.createTask({
      tenantId,
      title,
      description,
      priority,
      dueDate,
      statusCockpit,
      movimentoMinimo,
      effort,
      impact,
      return: returnValue
    });

    return reply.code(201).send(task);
  });

  fastify.patch('/api/v1/tasks/:taskId', async (request, reply) => {
    const { taskId } = request.params;
    const task = await tasksService.updateTask(taskId, request.body);
    if (!task) {
      return reply.code(404).send({ message: 'task_not_found' });
    }
    return task;
  });

  fastify.post('/api/v1/tasks/:taskId/complete', async (request, reply) => {
    const { taskId } = request.params;
    const task = await tasksService.completeTask(taskId);
    if (!task) {
      return reply.code(404).send({ message: 'task_not_found' });
    }
    return task;
  });
}
