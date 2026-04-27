import api from './axios.config';

type InterceptorStore = {
  getState: () => { auth: { token?: string | null } };
  dispatch: (action: { type: string }) => void;
};

export function setupInterceptors(store: InterceptorStore) {
  api.interceptors.request.use((config) => {
    const token = store.getState().auth.token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  api.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) store.dispatch({ type: 'auth/logout' });
      return Promise.reject(err);
    }
  );
}