import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchNotes } from 'entities/note';
import { ASYNC_STATUS, createAsyncState, NOTE_STATUS, formatRuDateTime } from 'shared';

export const useDashboardNotes = () => {
  const [notes, setNotes] = useState([]);
  const [requestState, setRequestState] = useState(createAsyncState({ status: ASYNC_STATUS.LOADING }));
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const processingIdsRef = useRef([]);

  const loadNotes = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) {
        setRequestState(createAsyncState({ status: ASYNC_STATUS.LOADING }));
      }
      const data = await fetchNotes();
      setNotes(data);
      if (!isSilent) {
        setRequestState(createAsyncState({ status: ASYNC_STATUS.SUCCESS }));
      }
    } catch (error) {
      if (!isSilent) {
        setRequestState(createAsyncState({ status: ASYNC_STATUS.ERROR, error: error.message || 'Ошибка загрузки конспектов' }));
      }
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const processingIds = useMemo(() => notes
    .filter((n) => n.status === NOTE_STATUS.PROCESSING)
    .map((n) => n.id)
    .sort((a, b) => String(a).localeCompare(String(b))), [notes]);

  const processingKey = useMemo(() => processingIds.join(','), [processingIds]);

  useEffect(() => {
    processingIdsRef.current = processingIds;
  }, [processingIds]);

  useEffect(() => {
    if (!processingKey) return undefined;

    let mounted = true;

    let fetchNotesStatusFn = null;
    const poll = async () => {
      try {
        if (!fetchNotesStatusFn) {
          // import here to avoid circular deps at module init
          const mod = await import('entities/note');
          fetchNotesStatusFn = mod.fetchNotesStatus;
        }
        const statuses = await fetchNotesStatusFn(processingIdsRef.current);
        if (!mounted || !Array.isArray(statuses)) return;

        setNotes((prev) => prev.map((note) => {
          const updated = statuses.find((s) => s.id === note.id);
          return updated ? { ...note, status: updated.status, updatedAt: updated.updatedAt, summaryPreview: updated.summaryPreview } : note;
        }));
      } catch (e) {
        // ignore polling errors silently to not disturb UI
        // eslint-disable-next-line no-console
        console.debug('Polling error', e);
      }
    };

    // run immediately once and then poll on an interval
    poll();
    const interval = setInterval(poll, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [processingKey]);

  const filteredAndSortedNotes = useMemo(() => {
    const filtered = notes.filter((note) => note.title.toLowerCase().includes(searchQuery.toLowerCase())
      || (note.summaryText && note.summaryText.toLowerCase().includes(searchQuery.toLowerCase())));

    filtered.sort((a, b) => {
      let aValue;
      let bValue;

      if (sortBy === 'title') {
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
      } else if (sortBy === 'status') {
        aValue = a.status;
        bValue = b.status;
      } else {
        const leftDateSource = sortBy === 'updatedAt' ? a.updatedAt || a.createdAt : a.createdAt;
        const rightDateSource = sortBy === 'updatedAt' ? b.updatedAt || b.createdAt : b.createdAt;
        aValue = new Date(leftDateSource);
        bValue = new Date(rightDateSource);
      }

      return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });

    return filtered;
  }, [notes, searchQuery, sortBy, sortOrder]);

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'только что';
    if (diffInHours < 24) return `${diffInHours} ч назад`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} д назад`;

    return formatRuDateTime(dateString);
  };

  return {
    notes,
    requestState,
    filteredAndSortedNotes,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    getTimeAgo,
    retry: () => loadNotes(false),
  };
};
