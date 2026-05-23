import React from 'react';
import { useProfile } from 'features';
import { ErrorState, LoadingState, isError, isLoading } from 'shared';
import { ProfileView } from 'widgets';

export const ProfilePage = () => {
  const model = useProfile();

  if (isLoading(model.requestState)) {
    return <LoadingState text="Загрузка профиля..." />;
  }

  if (isError(model.requestState)) {
    return <ErrorState message={model.requestState.error} />;
  }

  return <ProfileView profile={model.profile} stats={model.stats} onLogout={model.logout} />;
};
