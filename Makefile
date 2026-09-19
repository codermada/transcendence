.PHONY: help build up down restart logs ps shell exec \
        pull rebuild stop start clean prune

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
	@echo ""
	@echo "Shell access:"
	@echo "  make exec-postgres      Open shell in PostgreSQL container"
	@echo "  make exec-nginx         Open shell in Nginx container"
	@echo "  make exec-backend       Open shell in backend container"
	@echo "  make exec-frontend      Open shell in frontend container"
	@echo "  make shell SERVICE=app  Open shell in a service"
	@echo "  make exec SERVICE=app CMD=\"...\""
	@echo "                          Run command in a service"
	@echo ""
	@echo "Service management:"
	@echo "  make restart-postgres   Restart PostgreSQL container"
	@echo "  make restart-nginx      Restart Nginx container"
	@echo "  make restart-backend    Restart backend container"
	@echo "  make restart-frontend   Restart frontend container"
	@echo ""
	@echo "Rebuild:"
	@echo "  make rebuild             Rebuild all containers without cache"
	@echo "  make rebuild-postgres    Rebuild PostgreSQL"
	@echo "  make rebuild-nginx       Rebuild Nginx"
	@echo "  make rebuild-backend     Rebuild backend"
	@echo "  make rebuild-frontend    Rebuild frontend"
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
	docker compose logs -f postgres

log-nginx:
	docker compose logs -f nginx

log-backend:
	docker compose logs -f backend

log-frontend:
	docker compose logs -f frontend

exec-postgres:
	docker compose exec postgres bash

exec-nginx:
	docker compose exec nginx bash

exec-backend:
	docker compose exec backend bash

exec-frontend:
	docker compose exec frontend bash

restart-postgres:
	docker compose restart postgres

restart-nginx:
	docker compose restart nginx

restart-backend:
	docker compose restart backend

restart-frontend:
	docker compose restart frontend

rebuild-postgres:
	docker compose up -d --build --no-deps postgres

rebuild-nginx:
	docker compose up -d --build --no-deps nginx

rebuild-backend:
	docker compose up -d --build --no-deps backend

rebuild-frontend:
	docker compose up -d --build --no-deps frontend

prisma-studio:
	docker compose exec backend npm run prisma:studio

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

rm-images:
	$(COMPOSE) down -v --rmi all --remove-orphans

prune:
	docker system prune -a --volumes -f

fclean: rm-images prune
	docker volume prune --all

# Open a shell in a service:
# Usage: make shell SERVICE=app
shell:
	$(COMPOSE) exec $(SERVICE) sh

# Run an arbitrary command:
# Usage: make exec SERVICE=app CMD="python manage.py migrate"
exec:
	$(COMPOSE) exec $(SERVICE) $(CMD)
