import { supabase } from './supabase';

// ==================== TRANSFORMADOR ====================

export function dbToProfile(row) {
  if (!row) return {};
  return {
    id: row.id || '',
    name: row.name || '',
    email: row.email || '',
    phone: row.phone || '',
    role: row.role || '',
    bio: row.bio || '',
    avatar: row.avatar || null,
    cpf: row.cpf || '',
    companyId: row.company_id || '',
    salaryMonth: row.salary_month || '',
    hoursMonth: row.hours_month || 176,
    startDate: row.start_date || '',
  };
}

// ==================== HELPERS ====================

async function getCurrentUserId() {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

function localKey(userId) {
  return `settings_profile_${userId || 'default'}`;
}

// ==================== CRUD ====================
// Profile usa o ID do usuario autenticado (auth.uid).
// Usa upsert e dispara evento no window.

export async function getProfile() {
  const userId = await getCurrentUserId();

  if (!userId) {
    try {
      return JSON.parse(localStorage.getItem('settings_profile_default') || '{}');
    } catch {
      return {};
    }
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.log('⚠️ Perfil nao encontrado no Supabase, usando localStorage');
    try {
      return JSON.parse(localStorage.getItem(localKey(userId)) || '{}');
    } catch {
      return {};
    }
  }
  return dbToProfile(data);
}

export async function saveProfile(profile) {
  const userId = await getCurrentUserId();
  const id = userId || profile.id || 'default';

  const row = {
    id,
    name: profile.name || null,
    email: profile.email || null,
    phone: profile.phone || null,
    role: profile.role || null,
    cpf: profile.cpf || null,
    bio: profile.bio || null,
    avatar: profile.avatar || null,
    company_id: profile.companyId || null,
    salary_month: profile.salaryMonth || null,
    hours_month: profile.hoursMonth || 176,
    start_date: profile.startDate || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert([row], { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.log('⚠️ Supabase nao conectado, salvando perfil no localStorage');
    localStorage.setItem(localKey(id), JSON.stringify(profile));
    localStorage.setItem('settings_profile', JSON.stringify(profile));
    window.dispatchEvent(new Event('profile-updated'));
    return profile;
  }

  const saved = dbToProfile(data);
  localStorage.setItem(localKey(id), JSON.stringify(saved));
  localStorage.setItem('settings_profile', JSON.stringify(saved));
  window.dispatchEvent(new Event('profile-updated'));
  return saved;
}
