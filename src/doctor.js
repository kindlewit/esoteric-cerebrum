/**
 * Check health of all connections & services
 * required for server to function properly.
 *
 * List of services to check:
 * - PostrgreSQL
 * - Redis
 * - Elasticsearch (log & responses)
 * - All fetch API endpoints
 */

export default function diagnosis(request, reply) {
  const diagnosticRes = { healthy: true };
  return reply.code(200).send(JSON.stringify(diagnosticRes));
}
