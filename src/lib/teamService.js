import { createCRUDService } from './serviceFactory';

// ==================== TRANSFORMADOR ====================

export function dbToMember(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    role: row.role || '',
    color: row.color || '#3b82f6',
    workStart: row.work_start || '08:00',
    workEnd: row.work_end || '18:00',
    workDays: row.work_days || [1, 2, 3, 4, 5],
    salaryMonth: row.salary_month || 0,
    hoursMonth: row.hours_month || 176,
    email: row.email || '',
    authUserId: row.auth_user_id || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ==================== HELPERS ====================

/** "Kaynan Miguel Luper Silva" -> "Kaynan Silva" */
export function shortName(fullName) {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 2) return fullName.trim();
  return `${parts[0]} ${parts[parts.length - 1]}`;
}

// ==================== CORES PADRAO ====================

export const MEMBER_COLORS = [
  '#3b82f6', '#22c55e', '#f97316', '#ec4899',
  '#3b82f6', '#eab308', '#ef4444', '#2563eb',
  '#06b6d4', '#84cc16', '#f43f5e', '#14b8a6',
];

// ==================== CRUD (via factory) ====================

const memberService = createCRUDService({
  table: 'team_members',
  localKey: 'team_members',
  idPrefix: 'member',
  transform: dbToMember,
  fieldMap: {
    name: 'name',
    role: 'role',
    color: 'color',
    workStart: 'work_start',
    workEnd: 'work_end',
    workDays: 'work_days',
    salaryMonth: 'salary_month',
    hoursMonth: 'hours_month',
    email: 'email',
    authUserId: 'auth_user_id',
  },
});

export const getTeamMembers = memberService.getAll;
export const createTeamMember = (member) => memberService.create(member);
export const updateTeamMember = (id, updates) => memberService.update(id, updates);
export const deleteTeamMember = (id) => memberService.remove(id);
