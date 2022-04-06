The backend system for kindlewit, a quizzing platform.

## Tech Stack
- DB : PostgreSql
- Document DB : Elasticsearch
- ORM : Sequelize
- BE : NodeJS
- API : Fastify
- Caching : Redis
- Logging: Elasticsearch

## Installation
You will require [nodejs](https://nodejs.org/en/download/), [postgres](https://www.postgresql.org/download/), [elasticsearch](https://www.elastic.co/downloads/elasticsearch) and [redis](https://redis.io/download/) to run the server. Please install them as per your system. You could download them via docker.

```
# Install npm packages
npm install

# Build the project
npm build

# Start the API server
npm start
```

## Usage guide
### Database
Leave the default port for postgres (5432) as is.
Create a user: `username`, with password: `password` and a database: `thinq`.

### In-memory cache
Leave the default port for redis (6379) as is.

### Log & Document database
Leave the default ports for elasticsearch (9200, 9300) as is.

### Running via docker
`Dockerfile` & `docker-compose` are available at your disposal but currently do not work.

Meanwhile you can run the individual images as containers by the following commands.
<pre>
#Start redis container
docker run --name thinq-redis -p 6379:6379 -d redis:latest<br/>
#Start elasticsearch container
docker network create elastic
docker run --name thinq-elasticsearch --net elastic -e discovery.type="single-node" -p 9200:9200 -p 9300:9300 -d elasticsearch:7.17.2
</pre>

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
