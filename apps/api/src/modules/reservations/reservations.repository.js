import { randomUUID } from 'node:crypto';

export class ReservationsRepository {
  constructor() {
    this.tablesByTenant = new Map();
    this.reservationsByTenant = new Map();
    this.waitlistByTenant = new Map();
  }

  ensureTenant(tenantId) {
    if (!this.tablesByTenant.has(tenantId)) {
      this.tablesByTenant.set(tenantId, []);
    }
    if (!this.reservationsByTenant.has(tenantId)) {
      this.reservationsByTenant.set(tenantId, []);
    }
    if (!this.waitlistByTenant.has(tenantId)) {
      this.waitlistByTenant.set(tenantId, []);
    }
  }

  createTable({ tenantId, label, capacity }) {
    this.ensureTenant(tenantId);
    const table = {
      id: randomUUID(),
      tenantId,
      label,
      capacity,
      status: 'livre'
    };
    this.tablesByTenant.get(tenantId).push(table);
    return table;
  }

  listTables(tenantId) {
    this.ensureTenant(tenantId);
    return this.tablesByTenant.get(tenantId);
  }

  createReservation({ tenantId, guestName, seats }) {
    this.ensureTenant(tenantId);
    const reservation = {
      id: randomUUID(),
      tenantId,
      guestName,
      seats,
      status: 'reservada',
      createdAt: new Date().toISOString()
    };
    this.reservationsByTenant.get(tenantId).push(reservation);
    return reservation;
  }

  listReservations(tenantId) {
    this.ensureTenant(tenantId);
    return this.reservationsByTenant.get(tenantId);
  }

  countReservedSeats(tenantId) {
    return this.listReservations(tenantId)
      .filter((item) => item.status === 'reservada' || item.status === 'ocupada')
      .reduce((sum, item) => sum + item.seats, 0);
  }

  enqueueWaitlist({ tenantId, guestName, seats, priority = 0 }) {
    this.ensureTenant(tenantId);
    const item = {
      id: randomUUID(),
      tenantId,
      guestName,
      seats,
      priority,
      createdAt: new Date().toISOString()
    };
    const queue = this.waitlistByTenant.get(tenantId);
    queue.push(item);
    queue.sort((a, b) => b.priority - a.priority || a.createdAt.localeCompare(b.createdAt));
    return item;
  }

  listWaitlist(tenantId) {
    this.ensureTenant(tenantId);
    return this.waitlistByTenant.get(tenantId);
  }

  popWaitlist(tenantId) {
    this.ensureTenant(tenantId);
    return this.waitlistByTenant.get(tenantId).shift() || null;
  }

  updateTableStatus({ tenantId, tableId, status }) {
    const table = this.listTables(tenantId).find((item) => item.id === tableId);
    if (!table) {
      return null;
    }
    table.status = status;
    return table;
  }
}

