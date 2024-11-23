declare const window: any;

export const environment = {
  production: true,
  apiUrl: window?._env?.BACKEND_URL || 'http://localhost:5001'
};
