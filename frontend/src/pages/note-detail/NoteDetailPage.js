import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useNoteDetail } from 'features';
import { EmptyState, ErrorState, LoadingState, isError, isLoading } from 'shared';
import { NoteDetailView } from 'widgets';

export const NoteDetailPage = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();

  const model = useNoteDetail(noteId, () => navigate('/dashboard'));

  if (isLoading(model.requestState) && !model.note) {
    return <LoadingState text="Загрузка конспекта..." />;
  }

  if (isError(model.requestState)) {
    return <ErrorState message={model.requestState.error} action={<Link to="/dashboard" className="btn btn-primary">Назад к списку</Link>} />;
  }

  if (!model.note) {
    return <EmptyState title="Конспект не найден" description="Возможно, он был удален или у вас нет доступа к нему" action={<Link to="/dashboard" className="btn btn-primary">Назад к списку</Link>} />;
  }

  return (
    <NoteDetailView
      note={model.note}
      deleteLoading={model.deleteLoading}
      onDelete={() => {
        if (window.confirm('Вы уверены, что хотите удалить этот конспект?')) {
          model.deleteNote();
        }
      }}
    />
  );
};
