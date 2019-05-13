[![nps friendly](https://img.shields.io/badge/nps-friendly-blue.svg?style=flat-square)](https://github.com/kentcdodds/nps)

# bloomen decentralized rights management api


# Getting started

> Install Docker version 17.12.1-ce or higher.

> Install Docker-compose version 1.21.2 or higher.

1. Create containers:
 ```sh
 docker-compose build
 ```

3. Launch development server (http://localhost:3000/api/swagger):
 ```sh
 docker-compose up -d
 ```

# Project structure

```
data/                        Test data
api/                         Middleware project & Docker configuration
nginx/                       Nginx Docker configuration
solr/                        SOLR Docker configuration
```
