import axios, { type AxiosInstance } from 'axios';

let instance: AxiosInstance | null = null;

export function setupHttp(baseURL: string, getToken?: () => string | null): AxiosInstance {
  instance = axios.create({ baseURL, timeout: 15_000 });
  if (getToken) {
    instance.interceptors.request.use((config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }
  return instance;
}

export function http(): AxiosInstance {
  if (!instance) throw new Error('@cpm/api-client: call setupHttp() before requests');
  return instance;
}
