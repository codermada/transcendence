.PHONY: help build up down restart logs ps shell exec \
        pull rebuild stop start clean prune fclean

# Docker Compose command
COMPOSE := docker compose

help:
	@echo "Available commands:"
	@echo ""
	@echo "General:"
	@echo "  make build              Build containers"
	@echo "  make up                 Start containers (foreground)"
	@echo "  make up-d               Start containers (detached)"
	@echo "  make up-build-d         Build and start containers (detached)"
	@echo "  make down               Stop and remove containers"
	@echo "  make restart            Restart all containers"
	@echo "  make stop               Stop containers"
	@echo "  make start              Start existing containers"
	@echo ""
	@echo "Monitoring:"
	@echo "  make ps                 Show running containers"
	@echo "  make logs               Follow all container logs"
	@echo "  make log-postgres       Follow PostgreSQL logs"
	@echo "  make log-nginx          Follow Nginx logs"
	@echo "  make log-backend        Follow backend logs"
	@echo "  make log-frontend       Follow frontend logs"
	@echo "  make log-localstack     Follow LocalStack logs"
	@echo ""
	@echo "Shell access:"
	@echo "  make exec-postgres      Open shell in PostgreSQL container"
	@echo "  make exec-nginx         Open shell in Nginx container"
	@echo "  make exec-backend       Open shell in backend container"
	@echo "  make exec-frontend      Open shell in frontend container"
	@echo "  make exec-localstack    Open shell in LocalStack container"
	@echo "  make shell SERVICE=app  Open shell in a service"
	@echo "  make exec SERVICE=app CMD=\"...\""
	@echo "                          Run command in a service"
	@echo ""
	@echo "Service management:"
	@echo "  make restart-postgres   Restart PostgreSQL container"
	@echo "  make restart-nginx      Restart Nginx container"
	@echo "  make restart-backend    Restart backend container"
	@echo "  make restart-frontend   Restart frontend container"
	@echo "  make restart-localstack Restart LocalStack container"
	@echo ""
	@echo "Rebuild:"
	@echo "  make rebuild             Rebuild all containers without cache"
	@echo "  make rebuild-postgres    Rebuild PostgreSQL"
	@echo "  make rebuild-nginx       Rebuild Nginx"
	@echo "  make rebuild-backend     Rebuild backend"
	@echo "  make rebuild-frontend    Rebuild frontend"
	@echo "  make rebuild-localstack  Rebuild LocalStack"
	@echo ""
	@echo "LocalStack / S3:"
	@echo "  make ls-health          Check LocalStack health"
	@echo "  make ls-services        List available LocalStack services"
	@echo "  make ls-s3-buckets      List S3 buckets"
	@echo "  make ls-s3-create       Create bucket (BUCKET=name)"
	@echo "  make ls-s3-rm           Remove bucket (BUCKET=name)"
	@echo "  make ls-logs            Tail LocalStack logs"
	@echo "  make aws                Run aws CLI against LocalStack"
	@echo "                          Usage: make aws CMD=\"s3 ls\""
	@echo ""
	@echo "Images & cleanup:"
	@echo "  make pull                Pull latest images"
	@echo "  make clean               Remove containers, networks and volumes"
	@echo "  make prune               Remove unused Docker resources"


up-build-d:
	$(COMPOSE) up --build -d

build:
	$(COMPOSE) build

up:
	$(COMPOSE) up

up-d:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) restart

logs:
	$(COMPOSE) logs -f

log-postgres:
	$(COMPOSE) logs -f postgres

log-nginx:
	$(COMPOSE) logs -f nginx

log-backend:
	$(COMPOSE) logs -f backend

log-frontend:
	$(COMPOSE) logs -f frontend

log-localstack:
	$(COMPOSE) logs -f localstack

exec-postgres:
	$(COMPOSE) exec postgres bash

exec-nginx:
	$(COMPOSE) exec nginx bash

exec-backend:
	$(COMPOSE) exec backend bash

exec-frontend:
	$(COMPOSE) exec frontend bash

exec-localstack:
	$(COMPOSE) exec localstack bash

restart-postgres:
	$(COMPOSE) restart postgres

restart-nginx:
	$(COMPOSE) restart nginx

restart-backend:
	$(COMPOSE) restart backend

restart-frontend:
	$(COMPOSE) restart frontend

restart-localstack:
	$(COMPOSE) restart localstack

rebuild-postgres:
	$(COMPOSE) up -d --build --no-deps postgres

rebuild-nginx:
	$(COMPOSE) up -d --build --no-deps nginx

rebuild-backend:
	$(COMPOSE) up -d --build --no-deps backend

rebuild-frontend:
	$(COMPOSE) up -d --build --no-deps frontend

rebuild-localstack:
	$(COMPOSE) up -d --build --no-deps localstack

prisma-studio:
	$(COMPOSE) exec backend npm run prisma:studio

ps:
	$(COMPOSE) ps

pull:
	$(COMPOSE) pull

rebuild:
	$(COMPOSE) build --no-cache

stop:
	$(COMPOSE) stop

start:
	$(COMPOSE) start

# --- LocalStack / S3 helpers ------------------------------------------------
# Uses the LocalStack container's endpoint; override LS_ENDPOINT if needed.
LS_ENDPOINT ?= http://localhost:4566
AWS_ENV = AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test AWS_DEFAULT_REGION=us-east-1

ls-health:
	@curl -s $(LS_ENDPOINT)/_localstack/health | (command -v jq >/dev/null && jq . || cat)

ls-services:
	@curl -s $(LS_ENDPOINT)/_localstack/health | (command -v jq >/dev/null && jq '.services' || cat)

ls-s3-buckets:
	@$(AWS_ENV) aws --endpoint-url=$(LS_ENDPOINT) s3 ls

ls-s3-create:
	@test -n "$(BUCKET)" || (echo "Usage: make ls-s3-create BUCKET=my-bucket" && exit 1)
	@$(AWS_ENV) aws --endpoint-url=$(LS_ENDPOINT) s3 mb s3://$(BUCKET)

ls-s3-rm:
	@test -n "$(BUCKET)" || (echo "Usage: make ls-s3-rm BUCKET=my-bucket" && exit 1)
	@$(AWS_ENV) aws --endpoint-url=$(LS_ENDPOINT) s3 rb s3://$(BUCKET) --force

ls-logs:
	$(COMPOSE) logs -f localstack

# Run an arbitrary aws CLI command against LocalStack:
# Usage: make aws CMD="s3 ls"
aws:
	@test -n "$(CMD)" || (echo "Usage: make aws CMD=\"s3 ls\"" && exit 1)
	@$(AWS_ENV) aws --endpoint-url=$(LS_ENDPOINT) $(CMD)

# --- Cleanup ----------------------------------------------------------------
rm-images:
	$(COMPOSE) down -v --rmi all --remove-orphans

prune:
	docker system prune -a --volumes -f

clean: rm-images

fclean: rm-images prune
	docker volume prune --all -f

# Open a shell in a service:
# Usage: make shell SERVICE=app
shell:
	$(COMPOSE) exec $(SERVICE) sh

# Run an arbitrary command:
# Usage: make exec SERVICE=app CMD="python manage.py migrate"
exec:
	$(COMPOSE) exec $(SERVICE) $(CMD)