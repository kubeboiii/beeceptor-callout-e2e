require('dotenv').config();

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const primaryEndpoint = requireEnv('BEECEPTOR_PRIMARY_ENDPOINT');
const calloutTargetUrl = requireEnv('BEECEPTOR_CALLOUT_TARGET_URL');
const triggerPath = process.env.BEECEPTOR_TRIGGER_PATH || '/trigger';

module.exports = {
  primaryEndpoint,
  calloutTargetUrl,
  triggerPath,
  mockBaseUrl: `https://${primaryEndpoint}.free.beeceptor.com`,
  triggerUrl: `https://${primaryEndpoint}.free.beeceptor.com${triggerPath}`,
  consoleUrl: `https://app.beeceptor.com/console/${primaryEndpoint}`,
  appBaseUrl: 'https://app.beeceptor.com',
};
