import { randomUUID } from 'node:crypto';

export class MembershipRepository {
  constructor() {
    this.membersByTenant = new Map();
    this.benefitsByTenant = new Map();
    this.auditByTenant = new Map();
  }

  ensureTenant(tenantId) {
    if (!this.membersByTenant.has(tenantId)) {
      this.membersByTenant.set(tenantId, []);
    }
    if (!this.benefitsByTenant.has(tenantId)) {
      this.benefitsByTenant.set(tenantId, []);
    }
    if (!this.auditByTenant.has(tenantId)) {
      this.auditByTenant.set(tenantId, []);
    }
  }

  createMember({ tenantId, name, tier, validUntil }) {
    this.ensureTenant(tenantId);
    const member = {
      id: randomUUID(),
      tenantId,
      name,
      tier,
      status: 'active',
      validUntil,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.membersByTenant.get(tenantId).push(member);
    return member;
  }

  listMembers(tenantId) {
    this.ensureTenant(tenantId);
    return this.membersByTenant.get(tenantId);
  }

  updateMember({ tenantId, memberId, updates }) {
    const member = this.listMembers(tenantId).find((item) => item.id === memberId);
    if (!member) {
      return null;
    }
    Object.assign(member, updates);
    member.updatedAt = new Date().toISOString();
    return member;
  }

  createBenefit({ tenantId, name, eligibleTiers = [] }) {
    this.ensureTenant(tenantId);
    const benefit = {
      id: randomUUID(),
      tenantId,
      name,
      eligibleTiers
    };
    this.benefitsByTenant.get(tenantId).push(benefit);
    return benefit;
  }

  listBenefits(tenantId) {
    this.ensureTenant(tenantId);
    return this.benefitsByTenant.get(tenantId);
  }

  addAudit({ tenantId, memberId, action, actor }) {
    this.ensureTenant(tenantId);
    this.auditByTenant.get(tenantId).push({
      id: randomUUID(),
      tenantId,
      memberId,
      action,
      actor,
      createdAt: new Date().toISOString()
    });
  }

  listAudit(tenantId) {
    this.ensureTenant(tenantId);
    return this.auditByTenant.get(tenantId);
  }
}

