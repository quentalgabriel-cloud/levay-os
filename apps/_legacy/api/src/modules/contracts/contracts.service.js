export class ContractsService {
  constructor(repository, driveClient) {
    this.repository = repository;
    this.driveClient = driveClient;
  }

  async uploadContract({ tenantId, customerName, contentBase64, folderId, maxRetries = 3, simulateFailCount = 0 }) {
    let lastError = null;
    for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
      try {
        const fileName = `contract-${customerName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
        const uploaded = await this.driveClient.uploadFile({
          tenantId,
          fileName,
          contentBase64,
          folderId,
          simulateFailCount
        });

        const metadata = this.repository.saveContractMetadata({
          tenantId,
          customerName,
          fileId: uploaded.fileId,
          fileUrl: uploaded.fileUrl,
          provider: 'google-drive'
        });

        this.repository.addAudit({
          tenantId,
          type: 'contract.upload.success',
          message: 'Contract uploaded',
          metadata: { attempt, fileId: uploaded.fileId }
        });

        return { ok: true, metadata };
      } catch (error) {
        lastError = error;
        this.repository.addAudit({
          tenantId,
          type: 'contract.upload.retry',
          message: String(error.message || error),
          metadata: { attempt }
        });
      }
    }

    this.repository.addAudit({
      tenantId,
      type: 'contract.upload.failed',
      message: String(lastError ? lastError.message : 'unknown_error')
    });

    return { ok: false, reason: String(lastError ? lastError.message : 'unknown_error') };
  }

  listContracts(tenantId) {
    return this.repository.listContracts(tenantId);
  }

  listAudit(tenantId) {
    return this.repository.listAudit(tenantId);
  }
}

