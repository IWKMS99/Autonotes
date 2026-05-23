import { useEffect, useState } from 'react';
import { fetchNotes } from 'entities/note';
import { getUserProfile, getUsernameFromToken, clearToken } from 'entities/user';
import { ASYNC_STATUS, createAsyncState, NOTE_STATUS } from 'shared';

export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ totalNotes: 0, processedNotes: 0, totalSize: 0 });
  const [requestState, setRequestState] = useState(createAsyncState({ status: ASYNC_STATUS.LOADING }));

  useEffect(() => {
    const load = async () => {
      try {
        const username = getUsernameFromToken();
        if (!username) throw new Error('Не удалось получить имя пользователя из токена.');

        const profileData = await getUserProfile(username);
        const notes = await fetchNotes();

        const totalNotes = notes.length;
        const processedNotes = notes.filter((note) => note.status === NOTE_STATUS.COMPLETED).length;
        const totalSize = notes.reduce((size, note) => size + (note.images || []).reduce((s, img) => s + (img.size || 0), 0), 0);

        setProfile(profileData);
        setStats({
          totalNotes,
          processedNotes,
          totalSize: Math.round(totalSize / (1024 * 1024)),
        });
        setRequestState(createAsyncState({ status: ASYNC_STATUS.SUCCESS }));
      } catch (error) {
        setRequestState(createAsyncState({ status: ASYNC_STATUS.ERROR, error: error.message || 'Ошибка загрузки профиля' }));
      }
    };

    load();
  }, []);

  const logout = () => {
    clearToken();
    window.location.href = '/login';
  };

  return { profile, stats, requestState, logout };
};
