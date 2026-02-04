export const environment = {
  production: true,
  qrScanner: {
    scanInterval: 150, // milliseconds between scan attempts
    maxRetries: 5, // number of retries before giving up
    enableLogging: false, // disable console logging in production
  },
};
