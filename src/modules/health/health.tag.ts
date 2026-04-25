export const healthTagDescription = `
Health endpoints expose the runtime status of the GPT City API. They report
whether the server is up, which version is deployed, the current server time,
and whether the database is reachable.

These endpoints are intended for uptime monitors, deployment smoke tests, and
load-balancer health checks. They are unauthenticated and safe to poll.
`.trim();
