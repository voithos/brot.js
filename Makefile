bundle:
	./node_modules/.bin/browserify ./src/brot.js -o ./compiled.js

test:
	./node_modules/.bin/mocha --reporter list

.PHONY: bundle test
