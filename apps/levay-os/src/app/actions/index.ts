// Task Actions
export { createTask, updateTask, deleteTask, updateTaskStatus, bulkUpdateTaskStatus } from './tasks'

// Project Actions
export { createProject, updateProject, deleteProject, archiveProject } from './projects'

// Company Actions
export { createCompany, updateCompany, deleteCompany, bulkCreateCompanies } from './companies'

// Decision Actions
export { createDecision, updateDecision, archiveDecision, deleteDecision } from './decisions'

// Lacuna Actions
export { createLacuna, updateLacuna, resolveLacuna, deleteLacuna } from './lacunas'

// CRM Leads Actions (Sollu)
export {
  ensureSolluPipeline,
  getSolluPipeline,
  getSolluStages,
  getLeadsByPipeline,
  createLead,
  updateLeadStage,
  updateLeadStatus,
  addInteraction,
  getLeadInteractions,
} from './leads'