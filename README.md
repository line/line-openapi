# LINE OpenAPI

## What's this?

This is the OpenAPI spec of the LINE's Public APIs.

If you have an interesting use case for these files or have a request, please create an issue.

### Which APIs are supported in this repository?

1. This repository provides OpenAPI spec of the APIs, that listed on https://developers.line.biz/en/docs/.
2. This repository covers APIs on `api.line.me`, `api-data.line.me` and `manager.line.biz`.

## Project Files

| File                     | OpenAPI Version | API EndPoint                                                                              | Description              |
|--------------------------|-----------------|-------------------------------------------------------------------------------------------|--------------------------|
| channel-access-token.yml | 3.0.0           | https://api.line.me/                                                                      | Channel Access Token API |
| insight.yml              | 3.0.0           | https://api.line.me/v2/bot/insight/                                                       | Insight API              |
| liff.yml                 | 3.0.2           | https://api.line.me/liff/                                                                 | LIFF API                 |
| manage-audience.yml      | 3.0.0           | https://api.line.me/v2/bot/audienceGroup/, https://api-data.line.me/v2/bot/audienceGroup/ | Audience Group API       |
| messaging-api.yml        | 3.0.0           | https://api.line.me/v2/bot/, https://api-data.line.me/v2/bot/                             | Messaging API            |
| module.yml               | 3.0.0           | https://api.line.me/v2/bot/                                                               | Messaging API            |
| module-attach.yml        | 3.0.0           | https://manager.line.biz/module/auth/v1/token                                             | Messaging API            |
| shop.yml                 | 3.0.0           | https://api.line.me/shop/                                                                 | Mission Stickers API     |
|                          |                 |                                                                                           |                          |
| webhook.yml              | 3.0.3           |                                                                                           | Webhook Event Objects    |

## How to Contribute

Thank you for your interest in contributing to the **line/line-openapi** repository!
This project just publishes our public features as an OpenAPI schema to help developers easily access and integrate with them.
Our employees mainly update the schema based on the latest features and changes in our APIs.

Please note the following guidelines:

1. **Pull Requests**  
   We currently only accept Pull Requests from our employees.

2. **Issues First**  
   If you would like to propose a change, or discuss a problem, please open an issue first.

## Known issues

- OpenAPI Generator can't generate Python client with Java 17+
  - https://github.com/OpenAPITools/openapi-generator/issues/13684

## Usage

You can launch the Swagger UI to browse the OpenAPI specs locally using Docker.
First, make sure you have `docker-compose.yml` in this directory. Then run:

```sh
docker compose up
```

By default, the Swagger UI will be available at: [http://localhost:8080](http://localhost:8080)

### Using Docker Command

Alternatively, you can use the following Docker command:

```sh
docker run -p 8080:8080 -e PORT=8080 -e API_URL=/openapi/messaging-api.yml -v $(pwd):/usr/share/nginx/html/openapi swaggerapi/swagger-ui:latest
```
