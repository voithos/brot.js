bundle:
	./node_modules/.bin/browserify brot.js -o bundle.js

test:
	./node_modules/.bin/mocha --reporter list

.PHONY: bundle test
