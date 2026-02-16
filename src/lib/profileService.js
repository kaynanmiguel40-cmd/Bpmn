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

  // Garantir que SEMPRE retorna um profile com id, mesmo se tudo falhar
  const emptyProfile = { id: userId, name: '', email: '', phone: '', role: '', bio: '', avatar: null, cpf: '', companyId: '', salaryMonth: '', hoursMonth: 176, startDate: '' };

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data && data.name) {
      return dbToProfile(data);
    }

    // user_profiles nao existe ou esta sem nome.
    // Tentar auto-preencher a partir da tabela profiles (criada pelo trigger de auth).
    const { data: authProfile } = await supabase
      .from('profiles')
      .select('full_name, email, role')
      .eq('id', userId)
      .single();

    // Buscar dados do team_member para complementar (cargo, salario, etc.)
    // Tentar por auth_user_id primeiro, depois por email
    let teamMember = null;
    const { data: tmById } = await supabase
      .from('team_members')
      .select('name, role, salary_month, hours_month, email')
      .eq('auth_user_id', userId)
      .single();
    teamMember = tmById;

    if (!teamMember && authProfile?.email) {
      const { data: tmByEmail } = await supabase
        .from('team_members')
        .select('name, role, salary_month, hours_month, email')
        .eq('email', authProfile.email)
        .single();
      teamMember = tmByEmail;
    }

    const bestName = authProfile?.full_name || teamMember?.name || '';
    const bestEmail = teamMember?.email || authProfile?.email || '';

    if (bestName) {
      const autoProfile = {
        id: userId,
        name: bestName,
        email: bestEmail,
        role: teamMember?.role || '',
        salary_month: teamMember?.salary_month || null,
        hours_month: teamMember?.hours_month || 176,
        updated_at: new Date().toISOString(),
      };

      // Salvar no user_profiles para nao precisar fazer isso de novo
      await supabase
        .from('user_profiles')
        .upsert([autoProfile], { onConflict: 'id' });

      const profile = dbToProfile(autoProfile);
      localStorage.setItem(localKey(userId), JSON.stringify(profile));
      localStorage.setItem('settings_profile', JSON.stringify(profile));
      return profile;
    }

    // Se tiver dados parciais do user_profiles (sem nome), retornar com id
    if (data) {
      const profile = dbToProfile(data);
      return { ...emptyProfile, ...profile, id: userId };
    }

    // Nenhum dado no DB, tentar localStorage mas sempre com id
    try {
      const local = JSON.parse(localStorage.getItem(localKey(userId)) || '{}');
      return { ...emptyProfile, ...local, id: userId };
    } catch {
      return emptyProfile;
    }
  } catch (err) {
    console.error('Erro ao buscar profile:', err);
    // Mesmo com erro, retornar profile com id para useEffect funcionar
    try {
      const local = JSON.parse(localStorage.getItem(localKey(userId)) || '{}');
      return { ...emptyProfile, ...local, id: userId };
    } catch {
      return emptyProfile;
    }
  }
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
