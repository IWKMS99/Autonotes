import React from 'react';
import { useDashboardNotes } from 'features';
import { ErrorState, LoadingState, isError, isLoading } from 'shared';
import { NotesDashboardView } from 'widgets';

export const DashboardPage = () => {
  const model = useDashboardNotes();

  if (isLoading(model.requestState) && model.notes.length === 0) {
    return <LoadingState text="Загрузка конспектов..." />;
  }

  if (isError(model.requestState)) {
    return <ErrorState message={model.requestState.error} action={<button className="btn btn-primary" onClick={model.retry}>Повторить</button>} />;
  }

  return (
    <NotesDashboardView
      notes={model.notes}
      filteredNotes={model.filteredAndSortedNotes}
      searchQuery={model.searchQuery}
      setSearchQuery={model.setSearchQuery}
      sortBy={model.sortBy}
      setSortBy={model.setSortBy}
      sortOrder={model.sortOrder}
      setSortOrder={model.setSortOrder}
      getTimeAgo={model.getTimeAgo}
    />
  );
};
