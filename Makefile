.DEFAULT_GOAL := help


.PHONY: start
start: ## Start the Docker containers
	docker-compose up -d

.PHONY: stop
stop: ## Stop the Docker containers
	docker-compose down

.PHONY: db
db: ## Build and serve the backend
	@cd ./database && \
	go build && \
	mv pocketbase .. && \
	cd .. && \
	./pocketbase serve

.PHONY: npm
npm: ## Serve the frontend
	npm run dev

.PHONY: help
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
