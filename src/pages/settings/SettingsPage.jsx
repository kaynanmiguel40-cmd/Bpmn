/**
 * SettingsPage - Meu Perfil (visao do colaborador)
 *
 * O colaborador ve:
 * - Seus dados pessoais (nome, cargo, email, telefone)
 * - Empresa atribuida
 * - Salario mensal e valor/hora
 * - Resumo de horas do mes
 * - Preferencias e dados
 */

import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getProfile, saveProfile } from '../../lib/profileService';
import { useOSOrders, useTeamMembers, usePenalties, useCreatePenalty, useDeletePenalty, queryKeys } from '../../hooks/queries';
import { createTeamMember, updateTeamMember, deleteTeamMember, MEMBER_COLORS } from '../../lib/teamService';
import { supabase, getCompanies, createCompany, updateCompany, deleteCompany, createAuthUser, updateProfileRole } from '../../lib/supabase';
import { isManagerRole } from '../../lib/roleUtils';
import { NotificationPreferences } from '../../components/communication/NotificationPreferences';

// Mascara de CPF: 000.000.000-00
function maskCpf(value) {
  const digits = (value || '').replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

// Formatar moeda BRL
function formatCurrency(value) {
  const num = parseFloat(value);
  if (isNaN(num)) return 'R$ 0,00';
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Calcular valor/hora
function calcHourlyRate(salaryMonth, hoursMonth) {
  const salary = parseFloat(salaryMonth);
  const hours = parseFloat(hoursMonth);
  if (isNaN(salary) || isNaN(hours) || hours === 0) return 0;
  return salary / hours;
}

// Cores das empresas (mesmo do Dashboard) — com variantes dark
const COMPANY_COLORS = [
  { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800', dot: 'bg-blue-500' },
  { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
  { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800', dot: 'bg-amber-500' },
  { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800', dot: 'bg-rose-500' },
  { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800', dot: 'bg-cyan-500' },
  { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800', dot: 'bg-purple-500' },
];

// Cargos predefinidos — "Gestor" e similares concedem acesso de gestao automaticamente
const CARGO_OPTIONS = [
  'Gestor',
  'Diretor',
  'Coordenador',
  'Supervisor',
  'Operador',
  'Auxiliar',
  'Analista',
  'Estagiario',
];

export function SettingsPage() {
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState({});
  const [companies, setCompanies] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [loadingProfileCompanies, setLoadingProfileCompanies] = useState(true);
  const avatarInputRef = useRef(null);
  // Dados via React Query
  const { data: orders = [], isLoading: loadingOrders } = useOSOrders();
  const { data: teamMembers = [], isLoading: loadingTeamMembers } = useTeamMembers();
  const loading = loadingProfileCompanies || loadingOrders || loadingTeamMembers;
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberColor, setNewMemberColor] = useState(MEMBER_COLORS[0]);
  const [newMemberWorkStart, setNewMemberWorkStart] = useState('08:00');
  const [newMemberWorkEnd, setNewMemberWorkEnd] = useState('18:00');
  const [newMemberSalary, setNewMemberSalary] = useState('');
  const [newMemberHours, setNewMemberHours] = useState('176');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPassword, setNewMemberPassword] = useState('');
  const [newMemberIsGestor, setNewMemberIsGestor] = useState(false);
  const [creatingMember, setCreatingMember] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [customCargo, setCustomCargo] = useState(false);
  // Punicoes
  const [penaltyMember, setPenaltyMember] = useState(null);
  const [penaltyReason, setPenaltyReason] = useState('');
  const [confirmRevoke, setConfirmRevoke] = useState(null); // penalty id to revoke
  const { data: penalties = [] } = usePenalties();
  const createPenaltyMutation = useCreatePenalty();
  const deletePenaltyMutation = useDeletePenalty();
  // Empresa
  const [companyName, setCompanyName] = useState('');
  const [companyColor, setCompanyColor] = useState(0);
  const [companyImage, setCompanyImage] = useState(null);
  const [editingCompany, setEditingCompany] = useState(null);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const companyImageRef = useRef(null);

  const isManager = isManagerRole(profile);
  const [memberAvatars, setMemberAvatars] = useState({});

  useEffect(() => {
    (async () => {
      const [p, comps] = await Promise.all([getProfile(), getCompanies()]);
      setProfile(p);
      setCompanies(comps);
      setLoadingProfileCompanies(false);
    })();
  }, []);

  // Buscar avatares dos membros que tem conta (authUserId)
  useEffect(() => {
    if (loadingTeamMembers || teamMembers.length === 0) return;
    const authIds = teamMembers.filter(m => m.authUserId).map(m => m.authUserId);
    if (authIds.length === 0) return;
    (async () => {
      const { data } = await supabase
        .from('user_profiles')
        .select('id, avatar')
        .in('id', authIds);
      if (data) {
        const map = {};
        data.forEach(p => { if (p.avatar) map[p.id] = p.avatar; });
        setMemberAvatars(map);
      }
    })();
  }, [loadingTeamMembers, teamMembers]);

  // Auto-preencher profile com dados do team_member quando o profile esta vazio
  useEffect(() => {
    if (loadingTeamMembers || loadingProfileCompanies) return;
    if (!profile.id && !profile.email) return;
    const linked = teamMembers.find(m =>
      (m.authUserId && profile.id && m.authUserId === profile.id) ||
      (m.email && profile.email && m.email.toLowerCase().trim() === profile.email.toLowerCase().trim())
    );
    if (!linked) return;
    const updates = {};
    if (!profile.name && linked.name) updates.name = linked.name;
    if (!profile.role && linked.role) updates.role = linked.role;
    if (!profile.salaryMonth && linked.salaryMonth) updates.salaryMonth = linked.salaryMonth;
    if (!profile.hoursMonth && linked.hoursMonth) updates.hoursMonth = linked.hoursMonth;
    if (Object.keys(updates).length > 0) {
      const merged = { ...profile, ...updates };
      setProfile(merged);
      saveProfile(merged);
    }
  }, [loadingTeamMembers, loadingProfileCompanies, profile.id, profile.email]);

  const handleSave = async () => {
    await saveProfile(profile);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2000);
  };

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1 * 1024 * 1024) {
      alert('Imagem muito grande! Maximo: 1MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const newProfile = { ...profile, avatar: ev.target.result };
      setProfile(newProfile);
      await saveProfile(newProfile);
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 2000);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    const newProfile = { ...profile, avatar: null };
    setProfile(newProfile);
    await saveProfile(newProfile);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2000);
  };

  // Buscar team_member vinculado ao perfil logado (para fallback de salario)
  const myTeamMember = teamMembers.find(m =>
    (m.authUserId && profile.id && m.authUserId === profile.id) ||
    (m.email && profile.email && m.email.toLowerCase().trim() === profile.email.toLowerCase().trim())
  );

  // Calculos - usar dados do profile, com fallback do team_member
  const effectiveSalary = profile.salaryMonth || myTeamMember?.salaryMonth || 0;
  const effectiveHours = profile.hoursMonth || myTeamMember?.hoursMonth || 176;
  const hourlyRate = calcHourlyRate(effectiveSalary, effectiveHours);

  const selectedCompany = companies.find(c => c.id === profile.companyId);
  const selectedCompanyColor = selectedCompany ? COMPANY_COLORS[(selectedCompany.colorIndex || 0) % COMPANY_COLORS.length] : null;

  // Tabs
  const tabs = [
    { id: 'profile', label: 'Meu Perfil', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'team', label: 'Equipe', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'notifications', label: 'Notificacoes', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Configuracoes</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gerencie seu perfil e preferencias</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
            </svg>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* === TAB: Meu Perfil === */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Avatar */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Foto</h3>
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div
                  onClick={() => avatarInputRef.current?.click()}
                  className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-700 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all overflow-hidden"
                >
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                {profile.avatar && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    X
                  </button>
                )}
                <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </div>
              <div>
                <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">{profile.name || myTeamMember?.name || 'Sem nome'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{profile.role || myTeamMember?.role || 'Sem cargo'}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Clique na foto para alterar</p>
              </div>
            </div>
          </div>

          {/* Dados pessoais */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Dados Pessoais</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Nome completo</label>
                <input type="text" value={profile.name || myTeamMember?.name || ''} onChange={(e) => handleChange('name', e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Seu nome completo" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Cargo</label>
                <input type="text" value={profile.role || myTeamMember?.role || ''} onChange={(e) => handleChange('role', e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ex: Gestor, Operador" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">CPF</label>
                <input type="text" value={maskCpf(profile.cpf)} onChange={(e) => handleChange('cpf', e.target.value.replace(/\D/g, '').slice(0, 11))} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="000.000.000-00" maxLength={14} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">E-mail</label>
                <input type="email" value={profile.email || ''} onChange={(e) => handleChange('email', e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="email@exemplo.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Telefone</label>
                <input type="text" value={profile.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="(00) 00000-0000" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Data de inicio</label>
                <input type="date" value={profile.startDate || ''} onChange={(e) => handleChange('startDate', e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">Salvar Dados</button>
            </div>
          </div>

          {/* Financeiro */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Financeiro</h3>
            {/* Cards de exibicao - todos veem */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Salario Mensal</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{formatCurrency(effectiveSalary)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">Valor / Hora</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{formatCurrency(hourlyRate)}</p>
                </div>
              </div>
            </div>
            {/* Inputs editaveis - apenas gestores */}
            {isManager && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-3">Editar valores (apenas gestores)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Salario Mensal</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500">R$</span>
                      <input type="number" value={profile.salaryMonth || ''} onChange={(e) => handleChange('salaryMonth', e.target.value)} className="w-full pl-8 pr-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="3000" min="0" step="100" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Horas/Mes</label>
                    <input type="number" value={profile.hoursMonth || ''} onChange={(e) => handleChange('hoursMonth', e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="176" min="1" />
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">Salvar</button>
                </div>
              </div>
            )}
          </div>

          {/* Empresas */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Empresas</h3>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 dark:text-slate-500">{companies.length} empresa{companies.length !== 1 ? 's' : ''}</span>
                <button
                  onClick={() => { setShowCompanyForm(!showCompanyForm); setEditingCompany(null); setCompanyName(''); setCompanyColor(0); setCompanyImage(null); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Nova Empresa
                </button>
              </div>
            </div>

            {/* Formulario de nova empresa */}
            {(showCompanyForm || editingCompany) && (
            <div className="flex flex-wrap items-end gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Nome</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nome da empresa"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && companyName.trim()) {
                      (async () => {
                        const result = await createCompany({ name: companyName.trim(), colorIndex: companyColor, image: companyImage });
                        if (result) {
                          setCompanies(prev => [...prev, result]);
                          setCompanyName('');
                          setCompanyColor(0);
                          setCompanyImage(null);
                          setShowCompanyForm(false);
                        }
                      })();
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Cor</label>
                <div className="flex gap-1.5">
                  {COMPANY_COLORS.map((c, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCompanyColor(idx)}
                      className={`w-7 h-7 rounded-full ${c.dot} transition-all ${companyColor === idx ? 'ring-2 ring-offset-1 ring-slate-400 dark:ring-offset-slate-800 scale-110' : 'opacity-60 hover:opacity-100'}`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Logo</label>
                <div className="flex items-center gap-2">
                  {companyImage ? (
                    <div className="relative">
                      <img src={companyImage} alt="" className="w-10 h-10 rounded-lg object-contain bg-white dark:bg-slate-700 p-1 border border-slate-200 dark:border-slate-600" />
                      <button onClick={() => setCompanyImage(null)} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px]">x</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => companyImageRef.current?.click()}
                      className="w-9 h-9 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </button>
                  )}
                  <input
                    ref={companyImageRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 500 * 1024) { alert('Imagem muito grande! Max 500KB.'); return; }
                      const reader = new FileReader();
                      reader.onload = (ev) => setCompanyImage(ev.target.result);
                      reader.readAsDataURL(file);
                    }}
                  />
                </div>
              </div>
              <button
                onClick={async () => {
                  if (!companyName.trim()) return;
                  if (editingCompany) {
                    const updated = await updateCompany(editingCompany.id, { name: companyName.trim(), colorIndex: companyColor, image: companyImage });
                    if (updated) setCompanies(prev => prev.map(c => c.id === updated.id ? updated : c));
                    setEditingCompany(null);
                  } else {
                    const result = await createCompany({ name: companyName.trim(), colorIndex: companyColor, image: companyImage });
                    if (result) setCompanies(prev => [...prev, result]);
                  }
                  setCompanyName('');
                  setCompanyColor(0);
                  setCompanyImage(null);
                  setShowCompanyForm(false);
                }}
                disabled={!companyName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap disabled:opacity-50"
              >
                {editingCompany ? 'Salvar' : 'Criar'}
              </button>
              {editingCompany && (
                <button
                  onClick={() => { setEditingCompany(null); setCompanyName(''); setCompanyColor(0); setCompanyImage(null); setShowCompanyForm(false); }}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  Cancelar
                </button>
              )}
            </div>
            )}

            {/* Lista de empresas */}
            {companies.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">Nenhuma empresa cadastrada</p>
            ) : (
              <div className="space-y-2">
                {companies.map(comp => {
                  const cc = COMPANY_COLORS[(comp.colorIndex || 0) % COMPANY_COLORS.length];
                  const isSelected = profile.companyId === comp.id;
                  return (
                    <div key={comp.id} className={`flex items-center justify-between p-3 rounded-lg border transition-colors group ${isSelected ? `${cc.border} ${cc.bg}` : 'border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                      <div className="flex items-center gap-3">
                        {comp.image ? (
                          <img src={comp.image} alt="" className="w-10 h-10 rounded-lg object-contain bg-white dark:bg-slate-700 p-1" />
                        ) : (
                          <div className={`w-10 h-10 rounded-lg ${cc.bg} ${cc.text} flex items-center justify-center text-sm font-bold`}>
                            {comp.name?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{comp.name}</span>
                          {isSelected && <span className="ml-2 text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-full">Sua empresa</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!isSelected && (
                          <button
                            onClick={async () => {
                              const updated = { ...profile, companyId: comp.id };
                              setProfile(updated);
                              await saveProfile(updated);
                            }}
                            className="px-2 py-1 text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                          >
                            Selecionar
                          </button>
                        )}
                        <button
                          onClick={() => { setEditingCompany(comp); setCompanyName(comp.name); setCompanyColor(comp.colorIndex || 0); setCompanyImage(comp.image || null); setShowCompanyForm(false); }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm(`Remover "${comp.name}"?`)) return;
                            await deleteCompany(comp.id);
                            setCompanies(prev => prev.filter(c => c.id !== comp.id));
                            if (profile.companyId === comp.id) {
                              const updated = { ...profile, companyId: '' };
                              setProfile(updated);
                              await saveProfile(updated);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Remover"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* === TAB: Equipe === */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          {/* Lista de membros */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Funcionarios Cadastrados</h3>
                <span className="text-xs text-slate-400 dark:text-slate-500">{
                  teamMembers.filter(m => {
                    if (m.authUserId && profile.id && m.authUserId === profile.id) return false;
                    if (m.email && profile.email && m.email.toLowerCase().trim() === profile.email.toLowerCase().trim()) return false;
                    return true;
                  }).length + 1
                } membros</span>
              </div>
              {isManager && (
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Novo Funcionario
                </button>
              )}
            </div>

          {/* Modal Adicionar Funcionario */}
          {showAddMemberModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !creatingMember && setShowAddMemberModal(false)} />
              <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Novo Funcionario</h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Crie o login e configure o acesso</p>
                  </div>
                  <button
                    onClick={() => !creatingMember && setShowAddMemberModal(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                  {/* Nome */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Nome completo</label>
                    <input
                      type="text"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Robert Silva"
                    />
                  </div>

                  {/* Email e Senha */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Email (login)</label>
                      <input
                        type="email"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="email@empresa.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Senha</label>
                      <input
                        type="password"
                        value={newMemberPassword}
                        onChange={(e) => setNewMemberPassword(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Min. 6 caracteres"
                      />
                    </div>
                  </div>

                  {/* Cargo e Acesso */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Cargo</label>
                      {customCargo ? (
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={newMemberRole}
                            onChange={(e) => setNewMemberRole(e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Digite o cargo"
                            autoFocus
                          />
                          <button
                            onClick={() => { setCustomCargo(false); setNewMemberRole(''); }}
                            className="px-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          >X</button>
                        </div>
                      ) : (
                        <select
                          value={newMemberRole}
                          onChange={(e) => {
                            if (e.target.value === '_custom') {
                              setCustomCargo(true);
                              setNewMemberRole('');
                            } else {
                              setNewMemberRole(e.target.value);
                            }
                          }}
                          className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Selecione...</option>
                          {CARGO_OPTIONS.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                          <option value="_custom">Outro (digitar)</option>
                        </select>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Nivel de Acesso</label>
                      <button
                        type="button"
                        onClick={() => setNewMemberIsGestor(!newMemberIsGestor)}
                        className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                          newMemberIsGestor
                            ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-300'
                            : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          newMemberIsGestor ? 'border-amber-500 bg-amber-500' : 'border-slate-300 dark:border-slate-500'
                        }`}>
                          {newMemberIsGestor && <span className="text-white text-[10px]">&#10003;</span>}
                        </span>
                        {newMemberIsGestor ? 'Gestor (acesso completo)' : 'Colaborador (acesso limitado)'}
                      </button>
                    </div>
                  </div>

                  {/* Horario de Trabalho */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Horario de Trabalho</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={newMemberWorkStart}
                        onChange={(e) => setNewMemberWorkStart(e.target.value)}
                        className="flex-1 px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="text-xs text-slate-400 dark:text-slate-500">ate</span>
                      <input
                        type="time"
                        value={newMemberWorkEnd}
                        onChange={(e) => setNewMemberWorkEnd(e.target.value)}
                        className="flex-1 px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Salario e Horas (apenas gestor ve) */}
                  {isManager && (
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Salario Mensal / Horas</label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500">R$</span>
                          <input
                            type="number"
                            value={newMemberSalary}
                            onChange={(e) => setNewMemberSalary(e.target.value)}
                            className="w-full pl-8 pr-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="3000"
                            min="0"
                            step="100"
                          />
                        </div>
                        <span className="text-xs text-slate-400 dark:text-slate-500">/</span>
                        <div className="relative w-24">
                          <input
                            type="number"
                            value={newMemberHours}
                            onChange={(e) => setNewMemberHours(e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-700 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="176"
                            min="1"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 dark:text-slate-500">h/mes</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cor */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Cor do perfil</label>
                    <div className="flex gap-2">
                      {MEMBER_COLORS.slice(0, 8).map(c => (
                        <button
                          key={c}
                          onClick={() => setNewMemberColor(c)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${newMemberColor === c ? 'border-slate-800 dark:border-slate-200 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
                  <button
                    onClick={() => {
                      setShowAddMemberModal(false);
                      setNewMemberName('');
                      setNewMemberRole('');
                      setNewMemberEmail('');
                      setNewMemberPassword('');
                      setNewMemberIsGestor(false);
                      setCustomCargo(false);
                      setNewMemberWorkStart('08:00');
                      setNewMemberWorkEnd('18:00');
                      setNewMemberSalary('');
                      setNewMemberHours('176');
                    }}
                    disabled={creatingMember}
                    className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    disabled={creatingMember}
                    onClick={async () => {
                      if (!newMemberName.trim()) { alert('Nome e obrigatorio.'); return; }
                      if (!newMemberEmail.trim()) { alert('Email e obrigatorio para criar a conta.'); return; }
                      if (!newMemberPassword || newMemberPassword.length < 6) { alert('Senha deve ter no minimo 6 caracteres.'); return; }

                      setCreatingMember(true);
                      try {
                        // 1. Criar conta no Supabase Auth + definir role no profile
                        const profileRole = newMemberIsGestor ? 'manager' : 'collaborator';
                        const authResult = await createAuthUser(newMemberEmail.trim(), newMemberPassword, newMemberName.trim(), profileRole);
                        if (!authResult.success) {
                          alert('Erro ao criar conta: ' + authResult.error);
                          setCreatingMember(false);
                          return;
                        }

                        // 2. Criar membro na tabela team_members
                        const created = await createTeamMember({
                          name: newMemberName.trim(),
                          role: newMemberRole.trim(),
                          color: newMemberColor,
                          workStart: newMemberWorkStart,
                          workEnd: newMemberWorkEnd,
                          salaryMonth: parseFloat(newMemberSalary) || 0,
                          hoursMonth: parseFloat(newMemberHours) || 176,
                          email: newMemberEmail.trim(),
                          authUserId: authResult.userId,
                        });
                        if (created) {
                          await queryClient.invalidateQueries({ queryKey: queryKeys.teamMembers });
                          setShowAddMemberModal(false);
                          setNewMemberName('');
                          setNewMemberRole('');
                          setNewMemberEmail('');
                          setNewMemberPassword('');
                          setNewMemberIsGestor(false);
                          setCustomCargo(false);
                          setNewMemberWorkStart('08:00');
                          setNewMemberWorkEnd('18:00');
                          setNewMemberSalary('');
                          setNewMemberHours('176');
                          setNewMemberColor(MEMBER_COLORS[(teamMembers.length + 1) % MEMBER_COLORS.length]);
                        } else {
                          alert('Conta criada mas houve erro ao salvar na equipe. Tente novamente.');
                        }
                      } catch (err) {
                        alert('Erro inesperado: ' + err.message);
                      } finally {
                        setCreatingMember(false);
                      }
                    }}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {creatingMember ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        Criando conta...
                      </>
                    ) : 'Criar Funcionario'}
                  </button>
                </div>
              </div>
            </div>
          )}
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {/* Perfil logado (voce) */}
                {(() => {
                  // Buscar nome do team_member quando profile.name esta vazio
                  const linkedMember = teamMembers.find(m =>
                    (m.authUserId && profile.id && m.authUserId === profile.id) ||
                    (m.email && profile.email && m.email.toLowerCase().trim() === profile.email.toLowerCase().trim())
                  );
                  const displayName = profile.name || linkedMember?.name || 'Sem nome';
                  const displayRole = profile.role || linkedMember?.role || '';
                  const displayColor = linkedMember?.color || '#3b82f6';
                  return (
                <div className="px-6 py-3 flex items-center justify-between bg-blue-50/50 dark:bg-blue-900/10">
                  <div className="flex items-center gap-3">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-medium text-sm shrink-0" style={{ background: `linear-gradient(135deg, ${displayColor}, ${displayColor}cc)` }}>
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        {displayName}
                        <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-full">Voce</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {displayRole && <span className="text-xs text-slate-400 dark:text-slate-500">{displayRole}</span>}
                        {linkedMember && (
                          <span className="text-[10px] text-slate-300 dark:text-slate-500 bg-slate-50 dark:bg-slate-700/50 px-1.5 py-0.5 rounded">
                            {linkedMember.workStart || '08:00'} - {linkedMember.workEnd || '18:00'}
                          </span>
                        )}
                        {isManager && linkedMember && linkedMember.salaryMonth > 0 && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded font-medium">
                            R$ {(parseFloat(linkedMember.salaryMonth) / (parseFloat(linkedMember.hoursMonth) || 176)).toFixed(2)}/h
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    Editar Perfil
                  </button>
                </div>
                  );
                })()}
                {/* Demais membros (filtra o perfil logado para nao duplicar) */}
                {teamMembers.filter(m => {
                  if (m.authUserId && profile.id && m.authUserId === profile.id) return false;
                  if (m.email && profile.email && m.email.toLowerCase().trim() === profile.email.toLowerCase().trim()) return false;
                  return true;
                }).map(member => {
                  const cardCount = penalties.filter(p => p.memberId === member.id && !p.expired).length;
                  const isAlert = cardCount >= 3;
                  return (
                  <div key={member.id} className={`px-6 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group ${isAlert ? 'border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                    <div className="flex items-center gap-3">
                      {member.authUserId && memberAvatars[member.authUserId] ? (
                        <img src={memberAvatars[member.authUserId]} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                      ) : (
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-medium text-sm shrink-0"
                          style={{ backgroundColor: member.color }}
                        >
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{member.name}</span>
                          {/* Yellow card indicators */}
                          {cardCount > 0 && (
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: Math.min(cardCount, 3) }).map((_, i) => (
                                <div key={i} className="w-3.5 h-5 rounded-sm bg-yellow-400 border border-yellow-500 shadow-sm" title={`${cardCount}/3 cartoes`} />
                              ))}
                              {isAlert && (
                                <span className="ml-1 text-[9px] font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded-full uppercase">Alerta</span>
                              )}
                            </div>
                          )}
                        </div>
                        {member.email && (
                          <div className="text-[11px] text-slate-400 dark:text-slate-500">{member.email}</div>
                        )}
                        <div className="flex items-center gap-2">
                          {member.role && <span className="text-xs text-slate-400 dark:text-slate-500">{member.role}</span>}
                          <span className="text-[10px] text-slate-300 dark:text-slate-500 bg-slate-50 dark:bg-slate-700/50 px-1.5 py-0.5 rounded">
                            {member.workStart || '08:00'} - {member.workEnd || '18:00'}
                          </span>
                          {isManager && member.salaryMonth > 0 && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded font-medium">
                              R$ {(parseFloat(member.salaryMonth) / (parseFloat(member.hoursMonth) || 176)).toFixed(2)}/h
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isManager && (
                        <button
                          onClick={() => { setPenaltyMember(member); setPenaltyReason(''); }}
                          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                          title="Punicoes"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="3" width="12" height="18" rx="2" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          let isGestor = false;
                          if (member.authUserId) {
                            const { data: prof } = await supabase
                              .from('profiles')
                              .select('role')
                              .eq('id', member.authUserId)
                              .single();
                            isGestor = prof?.role === 'manager' || prof?.role === 'admin';
                          }
                          setEditingMember({
                            ...member,
                            _isGestor: isGestor,
                            _customCargo: member.role && !CARGO_OPTIONS.includes(member.role),
                          });
                        }}
                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm(`Remover ${member.name} da equipe?`)) return;
                          await deleteTeamMember(member.id);
                          queryClient.invalidateQueries({ queryKey: queryKeys.teamMembers });
                        }}
                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Remover"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>

          {/* Modal Editar Funcionario */}
          {editingMember && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditingMember(null)} />
              <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Editar Funcionario</h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{editingMember.email || 'Sem email'}</p>
                  </div>
                  <button
                    onClick={() => setEditingMember(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                  {/* Nome */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Nome completo</label>
                    <input
                      type="text"
                      value={editingMember.name}
                      onChange={(e) => setEditingMember(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Cargo e Acesso */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Cargo</label>
                      {editingMember._customCargo ? (
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={editingMember.role}
                            onChange={(e) => setEditingMember(prev => ({ ...prev, role: e.target.value }))}
                            className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Digite o cargo"
                            autoFocus
                          />
                          <button
                            onClick={() => setEditingMember(prev => ({ ...prev, _customCargo: false, role: '' }))}
                            className="px-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          >X</button>
                        </div>
                      ) : (
                        <select
                          value={CARGO_OPTIONS.includes(editingMember.role) ? editingMember.role : ''}
                          onChange={(e) => {
                            if (e.target.value === '_custom') {
                              setEditingMember(prev => ({ ...prev, _customCargo: true, role: '' }));
                            } else {
                              setEditingMember(prev => ({ ...prev, role: e.target.value }));
                            }
                          }}
                          className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Selecione...</option>
                          {CARGO_OPTIONS.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                          <option value="_custom">Outro (digitar)</option>
                        </select>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Nivel de Acesso</label>
                      <button
                        type="button"
                        onClick={() => setEditingMember(prev => ({ ...prev, _isGestor: !prev._isGestor }))}
                        className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                          editingMember._isGestor
                            ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-300'
                            : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          editingMember._isGestor ? 'border-amber-500 bg-amber-500' : 'border-slate-300 dark:border-slate-500'
                        }`}>
                          {editingMember._isGestor && <span className="text-white text-[10px]">&#10003;</span>}
                        </span>
                        {editingMember._isGestor ? 'Gestor (acesso completo)' : 'Colaborador (acesso limitado)'}
                      </button>
                    </div>
                  </div>

                  {/* Horario de Trabalho */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Horario de Trabalho</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={editingMember.workStart || '08:00'}
                        onChange={(e) => setEditingMember(prev => ({ ...prev, workStart: e.target.value }))}
                        className="flex-1 px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="text-xs text-slate-400 dark:text-slate-500">ate</span>
                      <input
                        type="time"
                        value={editingMember.workEnd || '18:00'}
                        onChange={(e) => setEditingMember(prev => ({ ...prev, workEnd: e.target.value }))}
                        className="flex-1 px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Salario e Horas (apenas gestor ve) */}
                  {isManager && (
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Salario Mensal / Horas</label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500">R$</span>
                          <input
                            type="number"
                            value={editingMember.salaryMonth || ''}
                            onChange={(e) => setEditingMember(prev => ({ ...prev, salaryMonth: e.target.value }))}
                            className="w-full pl-8 pr-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="3000"
                            min="0"
                            step="100"
                          />
                        </div>
                        <span className="text-xs text-slate-400 dark:text-slate-500">/</span>
                        <div className="relative w-24">
                          <input
                            type="number"
                            value={editingMember.hoursMonth || ''}
                            onChange={(e) => setEditingMember(prev => ({ ...prev, hoursMonth: e.target.value }))}
                            className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-700 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="176"
                            min="1"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 dark:text-slate-500">h/mes</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cor */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Cor do perfil</label>
                    <div className="flex gap-2">
                      {MEMBER_COLORS.slice(0, 8).map(c => (
                        <button
                          key={c}
                          onClick={() => setEditingMember(prev => ({ ...prev, color: c }))}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${editingMember.color === c ? 'border-slate-800 dark:border-slate-200 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
                  <button
                    onClick={() => setEditingMember(null)}
                    className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={async () => {
                      if (!editingMember.name?.trim()) { alert('Nome e obrigatorio.'); return; }
                      const updated = await updateTeamMember(editingMember.id, {
                        name: editingMember.name.trim(),
                        role: editingMember.role?.trim() || '',
                        color: editingMember.color,
                        workStart: editingMember.workStart,
                        workEnd: editingMember.workEnd,
                        salaryMonth: parseFloat(editingMember.salaryMonth) || 0,
                        hoursMonth: parseFloat(editingMember.hoursMonth) || 176,
                      });
                      if (editingMember.authUserId) {
                        const profileRole = editingMember._isGestor ? 'manager' : 'collaborator';
                        const roleResult = await updateProfileRole(editingMember.authUserId, profileRole);
                        if (!roleResult.success) {
                          console.warn('Nao foi possivel atualizar nivel de acesso:', roleResult.error);
                        }
                      }
                      if (updated) {
                        queryClient.invalidateQueries({ queryKey: queryKeys.teamMembers });
                      }
                      setEditingMember(null);
                    }}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Salvar Alteracoes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Punicoes */}
          {penaltyMember && (() => {
            const allMemberPenalties = penalties.filter(p => p.memberId === penaltyMember.id);
            const activePenalties = allMemberPenalties.filter(p => !p.expired);
            const expiredPenalties = allMemberPenalties.filter(p => p.expired);
            const cardCount = activePenalties.length;
            const canAdd = cardCount < 3;
            return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPenaltyMember(null)} />
              <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    {penaltyMember.authUserId && memberAvatars[penaltyMember.authUserId] ? (
                      <img src={memberAvatars[penaltyMember.authUserId]} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium" style={{ backgroundColor: penaltyMember.color }}>
                        {penaltyMember.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{penaltyMember.name}</h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex gap-1">
                          {[0, 1, 2].map(i => (
                            <div key={i} className={`w-4 h-5.5 rounded-sm border ${i < cardCount ? 'bg-yellow-400 border-yellow-500' : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600'}`} />
                          ))}
                        </div>
                        <span className={`text-xs font-bold ${cardCount >= 3 ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                          {cardCount}/3 cartoes
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setPenaltyMember(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                {/* Penalty list */}
                <div className="px-6 py-4">
                  {allMemberPenalties.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-sm">
                      Nenhuma punicao registrada
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Active penalties */}
                      {activePenalties.length > 0 && (
                        <>
                          <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">Cartoes Ativos</p>
                          {activePenalties.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((p) => {
                            const daysLeft = Math.max(0, Math.ceil((new Date(p.expiresAt) - new Date()) / 86400000));
                            return (
                            <div key={p.id} className="flex gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30">
                              <div className="w-6 h-8 rounded-sm bg-yellow-400 border border-yellow-500 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{p.reason}</p>
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                    por <span className="font-medium text-slate-500 dark:text-slate-400">{p.appliedByName}</span>
                                  </span>
                                  <span className="text-[10px] text-slate-300 dark:text-slate-600">•</span>
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                    {new Date(p.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                  </span>
                                  <span className="text-[10px] text-slate-300 dark:text-slate-600">•</span>
                                  <span className={`text-[10px] font-medium ${daysLeft <= 7 ? 'text-green-500' : 'text-orange-500 dark:text-orange-400'}`}>
                                    expira em {daysLeft}d
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => setConfirmRevoke(p.id)}
                                className="p-1 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors flex-shrink-0 self-start"
                                title="Revogar punicao"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            );
                          })}
                        </>
                      )}

                      {/* Expired penalties */}
                      {expiredPenalties.length > 0 && (
                        <>
                          <p className={`text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide ${activePenalties.length > 0 ? 'mt-2' : ''}`}>Expirados</p>
                          {expiredPenalties.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((p) => (
                            <div key={p.id} className="flex gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 opacity-60">
                              <div className="w-6 h-8 rounded-sm bg-slate-300 dark:bg-slate-600 border border-slate-400 dark:border-slate-500 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{p.reason}</p>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                    por {p.appliedByName}
                                  </span>
                                  <span className="text-[10px] text-slate-300 dark:text-slate-600">•</span>
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                    {new Date(p.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                  </span>
                                  <span className="text-[10px] text-slate-300 dark:text-slate-600">•</span>
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">expirado</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}

                  {/* Add new penalty */}
                  {cardCount >= 3 && (
                    <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-center">
                      <p className="text-sm font-medium text-red-600 dark:text-red-400">Limite de 3 cartoes ativos atingido</p>
                      <p className="text-[11px] text-red-500/70 dark:text-red-400/60 mt-0.5">Aguarde a expiracao ou revogue um cartao</p>
                    </div>
                  )}
                </div>

                {/* Footer - New penalty form */}
                {canAdd && (
                  <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Aplicar Novo Cartao</p>
                    <textarea
                      value={penaltyReason}
                      onChange={(e) => setPenaltyReason(e.target.value)}
                      placeholder="Descreva o motivo da punicao (minimo 10 caracteres)..."
                      rows={3}
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                    />
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {penaltyReason.length}/10 caracteres minimo
                      </span>
                      <button
                        disabled={penaltyReason.trim().length < 10 || createPenaltyMutation.isPending}
                        onClick={async () => {
                          await createPenaltyMutation.mutateAsync({
                            memberId: penaltyMember.id,
                            appliedByName: profile.name || 'Gestor',
                            appliedByUserId: profile.id || null,
                            reason: penaltyReason.trim(),
                          });
                          setPenaltyReason('');
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="6" y="3" width="12" height="18" rx="2" />
                        </svg>
                        {createPenaltyMutation.isPending ? 'Aplicando...' : 'Aplicar Cartao Amarelo'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            );
          })()}

          {/* Modal Confirmar Revogacao */}
          {confirmRevoke && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmRevoke(null)} />
              <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1">Revogar Punicao</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Tem certeza que deseja revogar esta punicao? O cartao amarelo sera removido.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmRevoke(null)}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      deletePenaltyMutation.mutate(confirmRevoke);
                      setConfirmRevoke(null);
                    }}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                  >
                    Sim, Revogar
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      )}

      {/* === TAB: Notificacoes === */}
      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <NotificationPreferences />
        </div>
      )}

      {/* Save Toast */}
      {showSaveToast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-800 dark:bg-slate-700 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fade-in">
          <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Salvo com sucesso!</span>
        </div>
      )}
    </div>
  );
}

export default SettingsPage;
