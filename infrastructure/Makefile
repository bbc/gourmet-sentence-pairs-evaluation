SOURCES := $(shell echo src/*.py)
TARGETS := $(patsubst src/%.py,templates/%.json,$(SOURCES))

all: $(TARGETS)

clean:
	rm -f $(TARGETS)

templates/%.json: src/%.py venv
	./venv/bin/python $< > $@

venv:
	test -d venv || virtualenv --no-site-packages venv
	. venv/bin/activate && \
		pip install awacs troposphere && \
		pip install git+ssh://git@github.com/BBC/cosmos-troposphere
