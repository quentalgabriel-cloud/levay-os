export class GoogleDriveClient {
  constructor() {
    this.failCounterByKey = new Map();
  }

  async uploadFile({ tenantId, fileName, contentBase64, folderId = 'contracts', simulateFailCount = 0 }) {
    const key = `${tenantId}:${fileName}`;
    const failuresSoFar = this.failCounterByKey.get(key) || 0;

    if (failuresSoFar < simulateFailCount) {
      this.failCounterByKey.set(key, failuresSoFar + 1);
      throw new Error('temporary_drive_error');
    }

    return {
      fileId: `${key}:file`,
      fileUrl: `https://drive.google.com/file/d/${encodeURIComponent(key)}`,
      folderId,
      size: contentBase64.length
    };
  }
}

