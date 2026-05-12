export class MembershipService {
  constructor(repository) {
    this.repository = repository;
  }

  createMember(payload, actor = 'system') {
    const member = this.repository.createMember(payload);
    this.repository.addAudit({
      tenantId: payload.tenantId,
      memberId: member.id,
      action: 'member.created',
      actor
    });
    return member;
  }

  listMembers(tenantId) {
    return this.repository.listMembers(tenantId);
  }

  renewMember({ tenantId, memberId, validUntil }, actor = 'system') {
    const updated = this.repository.updateMember({ tenantId, memberId, updates: { validUntil, status: 'active' } });
    if (!updated) {
      return null;
    }
    this.repository.addAudit({ tenantId, memberId, action: 'member.renewed', actor });
    return updated;
  }

  expireMember({ tenantId, memberId }, actor = 'system') {
    const updated = this.repository.updateMember({ tenantId, memberId, updates: { status: 'expired' } });
    if (!updated) {
      return null;
    }
    this.repository.addAudit({ tenantId, memberId, action: 'member.expired', actor });
    return updated;
  }

  cancelMember({ tenantId, memberId }, actor = 'system') {
    const updated = this.repository.updateMember({ tenantId, memberId, updates: { status: 'cancelled' } });
    if (!updated) {
      return null;
    }
    this.repository.addAudit({ tenantId, memberId, action: 'member.cancelled', actor });
    return updated;
  }

  createBenefit(payload) {
    return this.repository.createBenefit(payload);
  }

  listBenefits(tenantId) {
    return this.repository.listBenefits(tenantId);
  }

  checkBenefitEligibility({ tenantId, memberId, benefitId }) {
    const member = this.repository.listMembers(tenantId).find((item) => item.id === memberId);
    const benefit = this.repository.listBenefits(tenantId).find((item) => item.id === benefitId);
    if (!member || !benefit) {
      return { eligible: false, reason: 'not_found' };
    }
    if (member.status !== 'active') {
      return { eligible: false, reason: 'member_inactive' };
    }
    const eligible = benefit.eligibleTiers.includes(member.tier);
    return { eligible, reason: eligible ? null : 'tier_not_allowed' };
  }

  listOperationalView(tenantId) {
    const members = this.repository.listMembers(tenantId);
    const now = new Date().getTime();
    return {
      active: members.filter((item) => item.status === 'active'),
      expiringSoon: members.filter((item) => item.status === 'active' && new Date(item.validUntil).getTime() - now <= 7 * 86400000),
      all: members
    };
  }

  listAudit(tenantId) {
    return this.repository.listAudit(tenantId);
  }
}

