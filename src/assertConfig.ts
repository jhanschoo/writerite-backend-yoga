import config from 'config';

const PATHS = [
  'AUTH.GOOGLE_CLIENT_ID',
  'AUTH.FACEBOOK_APP_ID',
  'AUTH.FACEBOOK_APP_SECRET',
  'AUTH.RECAPTCHA_SECRET',
  'HTTPS.CERT_FILE',
  'HTTPS.KEY_FILE',
];

PATHS.forEach((path) => {
  if (!config.has(path)) {
    throw new Error(`configuration value ${path} not found`);
  }
});
