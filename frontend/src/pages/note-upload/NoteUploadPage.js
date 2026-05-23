import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNoteUpload } from 'features';
import { NoteUploadView } from 'widgets';

export const NoteUploadPage = () => {
  const navigate = useNavigate();
  const model = useNoteUpload(() => navigate('/dashboard'));

  return <NoteUploadView {...model} />;
};
