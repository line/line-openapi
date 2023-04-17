# line-openapi

## What's this?

This is the OpenAPI spec of the LINE's Public APIs.

If you have an interesting use case for these files or have a request, please create an issue.

### Which APIs are supported in this repository?

1. This repository provides OpenAPI spec of the APIs, that listed on https://developers.line.biz/en/docs/.
2. This repository covers APIs on `api.line.me`, `api-data.line.me` and `manager.line.biz`.

## Project Status

This project is currently under construction.

**MAINTAINERS WILL DO THE BREAKING CHANGE WITHOUT NOTICE.**

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


## Known issues

- OpenAPI Generator can't generate Python client with Java 17+
  - https://github.com/OpenAPITools/openapi-generator/issues/13684
