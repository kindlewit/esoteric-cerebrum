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
Create a user: `username`, with password: `password` and a database: `thinq`.

Install redis on your system. Leave the default port (6379) as is.
Install elasticsearch on your system (preferably v7.2). Leave the default port (9200, 9300) as is.

```
# Install npm packages
npm install

# Build the project
npm build

# Start the API server
npm start
```

## Folder structure

<pre>
.
|   Config and init files happen here
|
|---.github
|   |--- workflows
|     |-- Github workflows happen here
|
|---.vscode
|   |-- VS code settings happen here
|
|---src
|   |---handlers
|   |   |--- API handler functions happen here
|   |
|   |---models
|   |   |--- DB models happen here
|   |
|   |---routes
|   |   |--- API routing happens here
|   |
|   |---services
|   |   |--- DB services happen here
|   |
|   |---utils
|   |   |--- Utility functions happen here
|
|---tests
|   |---constants.js
|   |---raw_data.js
|   |---README.md
|   |---stress.js
|   |
|   |---simple
|   |   |--- Test files happens here
|
|---words
</pre>
