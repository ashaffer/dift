#
# Vars
#

BIN = ./node_modules/.bin
.DEFAULT_GOAL := all

#
# Tasks
#

node_modules: package.json
	@npm install
	@touch node_modules

test: node_modules
	${BIN}/babel-tape-runner test/*.js

benchmark: node_modules
	${BIN}/babel-tape-runner test/benchmark.js

validate: node_modules
	@${BIN}/standard

all: validate test

#
# Phony
#

.PHONY: test validate
