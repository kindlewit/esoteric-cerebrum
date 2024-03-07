export default function handleError(e, reply) {
  if (e.name == 'SequelizeUniqueConstraintError') {
    // Duplicate record error
    return reply.code(403).send(null);
  }
}
