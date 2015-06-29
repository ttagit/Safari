REPORTER = spec

TESTS = test/*.js test/**/*.js test/**/**/*.js

test:
	@NODE_ENV=test NODE_PATH=./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--ui bdd \
		--recursive

test-w:
	@NODE_ENV=test NODE_PATH=./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--growl \
		--watch
		--recursive

test-cov: lib-cov
	@MYPROJ_COVERAGE=1 $(MAKE) test REPORTER=html-cov > coverage.html

lib-cov:
	@jscoverage lib lib-cov

.PHONY: test test-w

# test:
# 	@NODE_ENV=test NODE_PATH=./config:./app/controllers ./node_modules/.bin/mocha \
#     --reporter $(REPORTER) \
#     --ui tdd \
#     $(TESTS)

# .PHONY: test%      