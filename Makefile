.PHONY: docker/open-api-doc
PORT ?= 8080
docker/open-api-doc:
	docker run --rm --name line-open-api-doc \
	-p $(PORT):8080 \
	-e PORT=8080 \
	-e API_URL=/openapi/messaging-api.yml \
	-v ./:/usr/share/nginx/html/openapi \
	swaggerapi/swagger-ui:latest
