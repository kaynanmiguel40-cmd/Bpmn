import { describe, it, expect } from 'vitest';
import { detectRole, isManagerRole, MANAGER_ROLES } from '../roleUtils';

describe('roleUtils', () => {
  describe('MANAGER_ROLES', () => {
    it('deve conter os roles padrão de gestor', () => {
      expect(MANAGER_ROLES).toContain('gestor');
      expect(MANAGER_ROLES).toContain('admin');
      expect(MANAGER_ROLES).toContain('gerente');
      expect(MANAGER_ROLES).toContain('manager');
      expect(MANAGER_ROLES).toContain('diretor');
      expect(MANAGER_ROLES).toContain('supervisor');
      expect(MANAGER_ROLES).toContain('coordenador');
    });
  });

  describe('detectRole', () => {
    it('deve retornar "collaborator" quando profile é null/undefined', () => {
      expect(detectRole(null)).toBe('collaborator');
      expect(detectRole(undefined)).toBe('collaborator');
    });

    it('deve retornar "collaborator" quando role está vazio', () => {
      expect(detectRole({})).toBe('collaborator');
      expect(detectRole({ role: '' })).toBe('collaborator');
    });

    it('deve detectar "manager" para roles de gestão', () => {
      expect(detectRole({ role: 'Gestor' })).toBe('manager');
      expect(detectRole({ role: 'Admin' })).toBe('manager');
      expect(detectRole({ role: 'gerente comercial' })).toBe('manager');
      expect(detectRole({ role: 'Diretor de TI' })).toBe('manager');
      expect(detectRole({ role: 'SUPERVISOR' })).toBe('manager');
      expect(detectRole({ role: 'coordenador de projetos' })).toBe('manager');
    });

    it('deve retornar "collaborator" para roles normais', () => {
      expect(detectRole({ role: 'desenvolvedor' })).toBe('collaborator');
      expect(detectRole({ role: 'designer' })).toBe('collaborator');
      expect(detectRole({ role: 'analista' })).toBe('collaborator');
      expect(detectRole({ role: 'estagiário' })).toBe('collaborator');
    });

    it('deve ser case-insensitive', () => {
      expect(detectRole({ role: 'GESTOR' })).toBe('manager');
      expect(detectRole({ role: 'gestor' })).toBe('manager');
      expect(detectRole({ role: 'Gestor' })).toBe('manager');
    });

    // Regressao: o match por substring elevava cargos administrativos a admin
    // (escalonamento de privilegio). Match agora e por palavra inteira.
    it('NAO deve elevar cargos que apenas CONTEM um keyword como substring', () => {
      expect(detectRole({ role: 'administrativo' })).toBe('collaborator');
      expect(detectRole({ role: 'Assistente Administrativo' })).toBe('collaborator');
      expect(detectRole({ role: 'auxiliar administrativo' })).toBe('collaborator');
    });

    it('ainda detecta gestor em cargos compostos (palavra inteira)', () => {
      expect(detectRole({ role: 'Gerente de Vendas' })).toBe('manager');
      expect(detectRole({ role: 'Diretor/Gestor' })).toBe('manager');
    });
  });

  describe('isManagerRole', () => {
    it('deve retornar true para roles de gestão', () => {
      expect(isManagerRole({ role: 'gestor' })).toBe(true);
      expect(isManagerRole({ role: 'admin' })).toBe(true);
    });

    it('deve retornar false para roles normais', () => {
      expect(isManagerRole({ role: 'desenvolvedor' })).toBe(false);
      expect(isManagerRole(null)).toBe(false);
    });
  });
});
