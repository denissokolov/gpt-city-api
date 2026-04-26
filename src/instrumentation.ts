import 'dotenv/config';

import logfire from '@pydantic/logfire-node';

if (process.env.LOGFIRE_WRITE_TOKEN) {
  logfire.configure({
    environment: process.env.APP_ENV,
    token: process.env.LOGFIRE_WRITE_TOKEN,
    serviceName: 'gpt-city',
    serviceVersion: '0.0.3',
  });
}
