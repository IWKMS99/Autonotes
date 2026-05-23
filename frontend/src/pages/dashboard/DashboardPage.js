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
      searchTerm={model.searchQuery}
      onSearchChange={model.setSearchQuery}
      sortBy={model.sortBy}
      onSortByChange={model.setSortBy}
      sortOrder={model.sortOrder}
      onSortOrderChange={model.setSortOrder}
      getTimeAgo={model.getTimeAgo}
    />
  );
};
