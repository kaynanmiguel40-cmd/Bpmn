/**
 * @fileoverview Definicoes de tipos JSDoc para o modulo CRM.
 * Usado para intellisense e documentacao.
 */

/**
 * @typedef {Object} CrmCompany
 * @property {string} id
 * @property {string} name
 * @property {string|null} cnpj
 * @property {string|null} segment
 * @property {string|null} size
 * @property {number|null} revenue
 * @property {string|null} phone
 * @property {string|null} email
 * @property {string|null} website
 * @property {string|null} address
 * @property {string|null} city
 * @property {string|null} state
 * @property {string|null} notes
 * @property {string|null} createdBy
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string|null} deletedAt
 */

/**
 * @typedef {Object} CrmContact
 * @property {string} id
 * @property {string} name
 * @property {string|null} email
 * @property {string|null} phone
 * @property {string|null} position
 * @property {string|null} avatarColor
 * @property {'lead'|'active'|'inactive'|'customer'} status
 * @property {string|null} companyId
 * @property {CrmCompany|null} company - Populado em getById
 * @property {string[]} tags
 * @property {string|null} address
 * @property {string|null} city
 * @property {string|null} state
 * @property {string|null} notes
 * @property {string|null} createdBy
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string|null} deletedAt
 */

/**
 * @typedef {Object} CrmPipeline
 * @property {string} id
 * @property {string} name
 * @property {boolean} isDefault
 * @property {string|null} createdBy
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {CrmPipelineStage[]} [stages] - Populado em queries com join
 */

/**
 * @typedef {Object} CrmPipelineStage
 * @property {string} id
 * @property {string} pipelineId
 * @property {string} name
 * @property {number} position
 * @property {string} color
 * @property {string} createdAt
 * @property {CrmDeal[]} [deals] - Populado em getDealsByPipeline
 */

/**
 * @typedef {Object} CrmDeal
 * @property {string} id
 * @property {string} title
 * @property {number} value
 * @property {number} probability
 * @property {string|null} contactId
 * @property {CrmContact|null} contact - Populado em queries com join
 * @property {string|null} companyId
 * @property {CrmCompany|null} company - Populado em queries com join
 * @property {string|null} pipelineId
 * @property {string|null} stageId
 * @property {CrmPipelineStage|null} stage - Populado em queries com join
 * @property {string|null} expectedCloseDate
 * @property {string|null} closedAt
 * @property {'open'|'won'|'lost'} status
 * @property {string|null} lostReason
 * @property {string|null} createdBy
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string|null} deletedAt
 */

/**
 * @typedef {Object} CrmActivity
 * @property {string} id
 * @property {string} title
 * @property {string|null} description
 * @property {'call'|'email'|'meeting'|'task'|'lunch'|'visit'} type
 * @property {string|null} contactId
 * @property {CrmContact|null} contact - Populado em queries com join
 * @property {string|null} dealId
 * @property {CrmDeal|null} deal - Populado em queries com join
 * @property {string} startDate
 * @property {string|null} endDate
 * @property {boolean} completed
 * @property {string|null} completedAt
 * @property {string|null} createdBy
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string|null} deletedAt
 */

/**
 * @typedef {Object} CrmProposal
 * @property {string} id
 * @property {string|null} dealId
 * @property {number} proposalNumber
 * @property {'draft'|'sent'|'viewed'|'accepted'|'rejected'} status
 * @property {string|null} notes
 * @property {string|null} terms
 * @property {number} totalValue
 * @property {string|null} createdBy
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string|null} deletedAt
 * @property {CrmProposalItem[]} [items] - Populado em getById
 * @property {CrmDeal|null} [deal] - Populado em getById
 */

/**
 * @typedef {Object} CrmProposalItem
 * @property {string} id
 * @property {string} proposalId
 * @property {string} name
 * @property {string|null} description
 * @property {number} quantity
 * @property {number} unitPrice
 * @property {number} discountPercent
 * @property {number} subtotal
 * @property {string} createdAt
 */

/**
 * @typedef {Object} CrmSettings
 * @property {string} id
 * @property {string} userId
 * @property {string|null} companyName
 * @property {string|null} companyPhone
 * @property {string|null} companyEmail
 * @property {string|null} companyAddress
 * @property {string|null} companyCity
 * @property {string|null} companyState
 * @property {string|null} companyLogoUrl
 * @property {string} accentColor
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} CrmDashboardKPIs
 * @property {number} totalContacts
 * @property {number} totalCompanies
 * @property {number} openDeals
 * @property {number} pipelineValue
 * @property {number} monthRevenue
 * @property {number} conversionRate
 * @property {number} pendingActivities
 * @property {number} dealsClosingSoon
 * @property {{month: string, value: number}[]} revenueByMonth
 * @property {{stageId: string, stageName: string, count: number, value: number}[]} dealsByStage
 * @property {CrmActivity[]} recentActivities
 */

export {};
