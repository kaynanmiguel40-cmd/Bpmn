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
import { getProfile, saveProfile } from '../../lib/profileService';
import { getOSOrders } from '../../lib/osService';
import { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember, MEMBER_COLORS } from '../../lib/teamService';
import { getCompanies, createCompany, updateCompany, deleteCompany, createAuthUser } from '../../lib/supabase';
import { isManagerRole } from '../../lib/roleUtils';
import { NotificationPreferences } from '../../components/communication/NotificationPreferences';

// Calcular horas de uma O.S. a partir das datas reais
function calcOSHours(order) {
  if (!order.actualStart || !order.actualEnd) return 0;
  const start = new Date(order.actualStart);
  const end = new Date(order.actualEnd);
  const diffMs = end - start;
  const diffDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);
  return diffDays * 8;
}

// Filtrar O.S. concluidas do mes atual a partir de lista carregada
function filterMonthOS(orders) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  return orders.filter(o => {
    if (o.status !== 'done' || !o.actualEnd) return false;
    const d = new Date(o.actualEnd);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
}

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
  const [profile, setProfile] = useState({});
  const [companies, setCompanies] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [loading, setLoading] = useState(true);
  const avatarInputRef = useRef(null);
  // Equipe
  const [teamMembers, setTeamMembers] = useState([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberColor, setNewMemberColor] = useState(MEMBER_COLORS[0]);
  const [newMemberWorkStart, setNewMemberWorkStart] = useState('08:00');
  const [newMemberWorkEnd, setNewMemberWorkEnd] = useState('18:00');
  const [newMemberSalary, setNewMemberSalary] = useState('');
  const [newMemberHours, setNewMemberHours] = useState('176');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPassword, setNewMemberPassword] = useState('');
  const [creatingMember, setCreatingMember] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [customCargo, setCustomCargo] = useState(false);
  // Empresa
  const [companyName, setCompanyName] = useState('');
  const [companyColor, setCompanyColor] = useState(0);
  const [companyImage, setCompanyImage] = useState(null);
  const [editingCompany, setEditingCompany] = useState(null);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const companyImageRef = useRef(null);

  const isManager = isManagerRole(profile);

  useEffect(() => {
    (async () => {
      const [p, o, members, comps] = await Promise.all([getProfile(), getOSOrders(), getTeamMembers(), getCompanies()]);
      setProfile(p);
      setOrders(o);
      setTeamMembers(members);
      setCompanies(comps);
      setLoading(false);
    })();
  }, []);

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

  // Calculos
  const hourlyRate = calcHourlyRate(profile.salaryMonth, profile.hoursMonth);
  const now = new Date();
  const monthOS = filterMonthOS(orders);
  const monthHours = monthOS.reduce((sum, o) => sum + calcOSHours(o), 0);
  const hoursPercent = profile.hoursMonth > 0 ? Math.min((monthHours / profile.hoursMonth) * 100, 100) : 0;

  const selectedCompany = companies.find(c => c.id === profile.companyId);
  const selectedCompanyColor = selectedCompany ? COMPANY_COLORS[(selectedCompany.colorIndex || 0) % COMPANY_COLORS.length] : null;

  // Tabs (aba Financeiro so aparece para gestores)
  const allTabs = [
    { id: 'profile', label: 'Meu Perfil', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'team', label: 'Equipe', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'notifications', label: 'Notificacoes', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    { id: 'financial', label: 'Financeiro', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];
  const tabs = allTabs.filter(t => isManager || t.id !== 'financial');

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
                <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">{profile.name || 'Sem nome'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{profile.role || 'Sem cargo'}</p>
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
                <input type="text" value={profile.name || ''} onChange={(e) => handleChange('name', e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Seu nome completo" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Cargo</label>
                <input type="text" value={profile.role || ''} onChange={(e) => handleChange('role', e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ex: Gestor, Operador" />
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
          {/* Adicionar membro */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">Adicionar Funcionario</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-4">Cargos como Gestor, Diretor, Coordenador e Supervisor concedem acesso de gestao automaticamente.</p>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Nome</label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nome completo"
                />
              </div>
              <div className="min-w-[180px]">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Email (login)</label>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@empresa.com"
                />
              </div>
              <div className="min-w-[120px]">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Senha</label>
                <input
                  type="password"
                  value={newMemberPassword}
                  onChange={(e) => setNewMemberPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Min. 6 caracteres"
                />
              </div>
              <div className="min-w-[150px]">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Cargo</label>
                {customCargo ? (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Digite o cargo"
                      autoFocus
                    />
                    <button
                      onClick={() => { setCustomCargo(false); setNewMemberRole(''); }}
                      className="px-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      title="Voltar para lista"
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
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Horario de Trabalho</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="time"
                    value={newMemberWorkStart}
                    onChange={(e) => setNewMemberWorkStart(e.target.value)}
                    className="px-2 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-xs text-slate-400 dark:text-slate-500">ate</span>
                  <input
                    type="time"
                    value={newMemberWorkEnd}
                    onChange={(e) => setNewMemberWorkEnd(e.target.value)}
                    className="px-2 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              {isManager && (
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Salario / Horas</label>
                <div className="flex items-center gap-1.5">
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500">R$</span>
                    <input
                      type="number"
                      value={newMemberSalary}
                      onChange={(e) => setNewMemberSalary(e.target.value)}
                      className="w-28 pl-7 pr-2 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="3000"
                      min="0"
                      step="100"
                    />
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500">/</span>
                  <div className="relative">
                    <input
                      type="number"
                      value={newMemberHours}
                      onChange={(e) => setNewMemberHours(e.target.value)}
                      className="w-16 px-2 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 dark:bg-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="176"
                      min="1"
                    />
                    <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 dark:text-slate-500">h</span>
                  </div>
                </div>
              </div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Cor</label>
                <div className="flex gap-1">
                  {MEMBER_COLORS.slice(0, 8).map(c => (
                    <button
                      key={c}
                      onClick={() => setNewMemberColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${newMemberColor === c ? 'border-slate-800 dark:border-slate-200 scale-110' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <button
                disabled={creatingMember}
                onClick={async () => {
                  if (!newMemberName.trim()) return;
                  if (!newMemberEmail.trim()) { alert('Email e obrigatorio para criar a conta.'); return; }
                  if (!newMemberPassword || newMemberPassword.length < 6) { alert('Senha deve ter no minimo 6 caracteres.'); return; }

                  setCreatingMember(true);
                  try {
                    // 1. Criar conta no Supabase Auth
                    const authResult = await createAuthUser(newMemberEmail.trim(), newMemberPassword, newMemberName.trim());
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
                      setTeamMembers(prev => [...prev, created]);
                      setNewMemberName('');
                      setNewMemberRole('');
                      setNewMemberEmail('');
                      setNewMemberPassword('');
                      setCustomCargo(false);
                      setNewMemberWorkStart('08:00');
                      setNewMemberWorkEnd('18:00');
                      setNewMemberSalary('');
                      setNewMemberHours('176');
                      setNewMemberColor(MEMBER_COLORS[(teamMembers.length + 1) % MEMBER_COLORS.length]);
                    }
                  } catch (err) {
                    alert('Erro inesperado: ' + err.message);
                  } finally {
                    setCreatingMember(false);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingMember ? 'Criando...' : 'Adicionar'}
              </button>
            </div>
          </div>

          {/* Lista de membros */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Funcionarios Cadastrados</h3>
              <span className="text-xs text-slate-400 dark:text-slate-500">{teamMembers.length + 1} membro{teamMembers.length !== 0 ? 's' : ''}</span>
            </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {/* Perfil logado (voce) */}
                <div className="px-6 py-3 flex items-center justify-between bg-blue-50/50 dark:bg-blue-900/10">
                  <div className="flex items-center gap-3">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-medium text-sm shrink-0">
                        {(profile.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        {profile.name || 'Sem nome'}
                        <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-full">Voce</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {profile.role && <span className="text-xs text-slate-400 dark:text-slate-500">{profile.role}</span>}
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
                {/* Demais membros */}
                {teamMembers.map(member => (
                  <div key={member.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                    {editingMember?.id === member.id ? (
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="text"
                          value={editingMember.name}
                          onChange={(e) => setEditingMember(prev => ({ ...prev, name: e.target.value }))}
                          className="flex-1 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm dark:text-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {editingMember._customCargo ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={editingMember.role}
                              onChange={(e) => setEditingMember(prev => ({ ...prev, role: e.target.value }))}
                              className="w-28 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm dark:text-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Cargo"
                              autoFocus
                            />
                            <button
                              onClick={() => setEditingMember(prev => ({ ...prev, _customCargo: false, role: '' }))}
                              className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >X</button>
                          </div>
                        ) : (
                          <select
                            value={CARGO_OPTIONS.includes(editingMember.role) ? editingMember.role : (editingMember.role ? '_custom' : '')}
                            onChange={(e) => {
                              if (e.target.value === '_custom') {
                                setEditingMember(prev => ({ ...prev, _customCargo: true, role: prev.role || '' }));
                              } else {
                                setEditingMember(prev => ({ ...prev, role: e.target.value }));
                              }
                            }}
                            className="w-32 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm dark:text-slate-200 dark:bg-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Cargo</option>
                            {CARGO_OPTIONS.map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                            <option value="_custom">Outro</option>
                          </select>
                        )}
                        <div className="flex items-center gap-1">
                          <input
                            type="time"
                            value={editingMember.workStart || '08:00'}
                            onChange={(e) => setEditingMember(prev => ({ ...prev, workStart: e.target.value }))}
                            className="px-1.5 py-0.5 border border-slate-300 dark:border-slate-600 rounded text-xs dark:text-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">-</span>
                          <input
                            type="time"
                            value={editingMember.workEnd || '18:00'}
                            onChange={(e) => setEditingMember(prev => ({ ...prev, workEnd: e.target.value }))}
                            className="px-1.5 py-0.5 border border-slate-300 dark:border-slate-600 rounded text-xs dark:text-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        {isManager && (
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">R$</span>
                          <input
                            type="number"
                            value={editingMember.salaryMonth || ''}
                            onChange={(e) => setEditingMember(prev => ({ ...prev, salaryMonth: e.target.value }))}
                            className="w-20 px-1.5 py-0.5 border border-slate-300 dark:border-slate-600 rounded text-xs dark:text-slate-200 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="3000"
                          />
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">/</span>
                          <input
                            type="number"
                            value={editingMember.hoursMonth || ''}
                            onChange={(e) => setEditingMember(prev => ({ ...prev, hoursMonth: e.target.value }))}
                            className="w-12 px-1 py-0.5 border border-slate-300 dark:border-slate-600 rounded text-xs dark:text-slate-200 dark:bg-slate-700 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="176"
                          />
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">h</span>
                        </div>
                        )}
                        <div className="flex gap-1">
                          {MEMBER_COLORS.slice(0, 6).map(c => (
                            <button
                              key={c}
                              onClick={() => setEditingMember(prev => ({ ...prev, color: c }))}
                              className={`w-5 h-5 rounded-full border-2 ${editingMember.color === c ? 'border-slate-800 dark:border-slate-200' : 'border-transparent'}`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                        <button
                          onClick={async () => {
                            const updated = await updateTeamMember(editingMember.id, {
                              name: editingMember.name,
                              role: editingMember.role,
                              color: editingMember.color,
                              workStart: editingMember.workStart,
                              workEnd: editingMember.workEnd,
                              salaryMonth: parseFloat(editingMember.salaryMonth) || 0,
                              hoursMonth: parseFloat(editingMember.hoursMonth) || 176,
                            });
                            if (updated) {
                              setTeamMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
                            }
                            setEditingMember(null);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditingMember(null)}
                          className="px-2 py-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 text-xs"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-medium text-sm shrink-0"
                            style={{ backgroundColor: member.color }}
                          >
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-800 dark:text-slate-100">{member.name}</div>
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
                          <button
                            onClick={() => setEditingMember({ ...member })}
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
                              setTeamMembers(prev => prev.filter(m => m.id !== member.id));
                            }}
                            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Remover"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
          </div>
        </div>
      )}

      {/* === TAB: Notificacoes === */}
      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <NotificationPreferences />
        </div>
      )}

      {/* === TAB: Financeiro === */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          {/* Cards de resumo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Salario Mensal</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{formatCurrency(profile.salaryMonth)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Valor / Hora</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{formatCurrency(hourlyRate)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progresso do mes */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </h3>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {monthHours.toFixed(1)}h / {profile.hoursMonth}h
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  hoursPercent >= 100 ? 'bg-emerald-500' : hoursPercent >= 75 ? 'bg-amber-500' : 'bg-blue-500'
                }`}
                style={{ width: `${hoursPercent}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-400 dark:text-slate-500">
              <span>{hoursPercent.toFixed(0)}% completo</span>
              <span>Restam {Math.max(0, profile.hoursMonth - monthHours).toFixed(1)}h</span>
            </div>
          </div>

          {/* Historico de O.S. do mes */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Horas por O.S.</h3>
            </div>
            {monthOS.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <svg className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm text-slate-400 dark:text-slate-500">Nenhuma O.S. concluida este mes</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-96 overflow-y-auto">
                {monthOS.map(order => {
                  const hours = calcOSHours(order);
                  return (
                    <div key={order.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[50px]">
                          <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{hours}h</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-700 dark:text-slate-200">
                            <span className="text-slate-400 dark:text-slate-500 font-mono text-xs">#{order.number}</span>{' '}
                            {order.title}
                          </div>
                          <div className="text-xs text-slate-400 dark:text-slate-500">
                            {order.client || 'Sem cliente'}
                            {order.actualEnd && (
                              <span> &middot; Concluida em {new Date(order.actualEnd).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium rounded-full">
                        Concluida
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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
