const MAX_CAPACITY = 70;

export class ReservationsService {
  constructor(repository) {
    this.repository = repository;
  }

  createTable(payload) {
    return this.repository.createTable(payload);
  }

  listTables(tenantId) {
    return this.repository.listTables(tenantId);
  }

  createReservation({ tenantId, guestName, seats }) {
    const currentSeats = this.repository.countReservedSeats(tenantId);
    if (currentSeats + seats > MAX_CAPACITY) {
      return { ok: false, reason: 'capacity_exceeded' };
    }
    return { ok: true, reservation: this.repository.createReservation({ tenantId, guestName, seats }) };
  }

  listReservations(tenantId) {
    return this.repository.listReservations(tenantId);
  }

  enqueueWaitlist(payload) {
    return this.repository.enqueueWaitlist(payload);
  }

  listWaitlist(tenantId) {
    return this.repository.listWaitlist(tenantId);
  }

  promoteFromWaitlist(tenantId) {
    const candidate = this.repository.popWaitlist(tenantId);
    if (!candidate) {
      return { ok: false, reason: 'empty_waitlist' };
    }

    const result = this.createReservation({
      tenantId,
      guestName: candidate.guestName,
      seats: candidate.seats
    });

    if (!result.ok) {
      this.repository.enqueueWaitlist(candidate);
      return { ok: false, reason: result.reason };
    }
    return { ok: true, reservation: result.reservation };
  }

  updateTableStatus({ tenantId, tableId, status }) {
    return this.repository.updateTableStatus({ tenantId, tableId, status });
  }
}

