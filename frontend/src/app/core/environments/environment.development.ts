export const environment = {
  production: false,

  api: {
    auth: 'http://localhost:3000/api/auth/',
    deviceMembers: 'http://localhost:3000/api/devicemembers/',
    devices: 'http://localhost:3000/api/devices/',
    users: 'http://localhost:3000/api/users/',
    refresh: 'http://localhost:3000/api/auth/refresh'
  },

  appName: 'SMP',
  enableLogging: true
};