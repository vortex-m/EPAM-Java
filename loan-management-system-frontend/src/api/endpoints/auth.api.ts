import api from '../axios.config';
import type { LoginRequest, RegisterRequest } from '@/types/auth.types';

export const authApi = {
  login: (body: LoginRequest) =>
    api.post('/auth/login', {
      loginId: body.loginId,
      password: body.password,
    }),
  register: (body: RegisterRequest) =>
    api.post('/auth/register', {
      name: body.name,
      email: body.email,
      password: body.password,
      phone: body.phone,
      role: "USER",
      address: body.address,
    }),
  bootstrapAdmin: (body: unknown) => api.post('/admin/bootstrap', body),
};