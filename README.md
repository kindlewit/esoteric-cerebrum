The backend system for kindlewit, a quizzing platform.

# Tech Stack
- DB : PostgreSql
- Document DB : Elasticsearch
- ORM : Sequelize
- BE : NodeJS
- API : Fastify
- Caching : Redis
- Logging: Elasticsearch

# Initial setup
Install postgresql on your system. Leave the default port (5432) as is.
Create a user: `user`, with password: `pwd` and a database: `thinq`.

Install redis on your system. Leave the default port (6379) as is.

Install elasticsearch on your system (preferably v7.2). Leave the default port (9200, 9300) as is.

Install all required npm packages by running

```npm install```

Build the project by running

```npm build```

Start the API server by running

```npm start```
