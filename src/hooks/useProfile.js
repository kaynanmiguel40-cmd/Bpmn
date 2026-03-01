import { useState, useEffect } from 'react';
import { getProfile } from '../lib/profileService';

/**
 * Hook reutilizavel para carregar o perfil do usuario.
 * Substitui o pattern repetido em 6+ arquivos:
 *   const [profile, setProfile] = useState({});
 *   useEffect(() => { getProfile().then(setProfile); }, []);
 *
 * @returns {{ profile: object, isLoading: boolean }}
 */
export function useProfile(defaultValue = {}) {
  const [profile, setProfile] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then(data => setProfile(data || defaultValue))
      .catch(err => console.error('Erro ao carregar perfil:', err))
      .finally(() => setIsLoading(false));
  }, []);

  return { profile, isLoading };
}
