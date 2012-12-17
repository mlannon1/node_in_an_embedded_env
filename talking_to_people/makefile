build:
	ls -d `pwd`/client/* | grep .*.js | xargs ./node_modules/.bin/browserify client/client.js -o public/javascripts/bundle.js

start: build
	-node app.js
