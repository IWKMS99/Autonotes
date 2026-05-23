export const ASYNC_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

export const createAsyncState = (overrides = {}) => ({
  status: ASYNC_STATUS.IDLE,
  error: '',
  ...overrides,
});

export const isLoading = (state) => state.status === ASYNC_STATUS.LOADING;
export const isError = (state) => state.status === ASYNC_STATUS.ERROR;
export const isSuccess = (state) => state.status === ASYNC_STATUS.SUCCESS;
export const isEmpty = (state, items) => isSuccess(state) && (!items || items.length === 0);
