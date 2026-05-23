import { useCallback, useEffect, useState } from 'react';
import { fetchNoteById, removeNoteById } from 'entities/note';
import { ASYNC_STATUS, createAsyncState } from 'shared';

export const useNoteDetail = (noteId, onDeleted) => {
  const [note, setNote] = useState(null);
  const [requestState, setRequestState] = useState(createAsyncState({ status: ASYNC_STATUS.LOADING }));
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadNote = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) {
        setRequestState(createAsyncState({ status: ASYNC_STATUS.LOADING }));
      }
      const data = await fetchNoteById(noteId);
      setNote(data);
      if (!isSilent) {
        setRequestState(createAsyncState({ status: ASYNC_STATUS.SUCCESS }));
      }
    } catch (error) {
      setRequestState(createAsyncState({ status: ASYNC_STATUS.ERROR, error: error.message || 'Ошибка загрузки конспекта' }));
    }
  }, [noteId]);

  useEffect(() => {
    loadNote();
  }, [loadNote]);

  useEffect(() => {
    if (note?.status !== 'PROCESSING') return undefined;
    const interval = setInterval(() => loadNote(true), 5000);
    return () => clearInterval(interval);
  }, [note?.status, loadNote]);

  const deleteNote = async () => {
    setDeleteLoading(true);
    try {
      await removeNoteById(noteId);
      onDeleted();
    } catch (error) {
      setRequestState(createAsyncState({ status: ASYNC_STATUS.ERROR, error: error.message || 'Ошибка при удалении конспекта' }));
    } finally {
      setDeleteLoading(false);
    }
  };

  return {
    note,
    requestState,
    deleteLoading,
    deleteNote,
  };
};
