.PHONY: db
db:
	cd ./database; go run . serve

.PHONY: npm
npm:
	npm run dev
