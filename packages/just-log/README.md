# just-log

`just-log` is a simple, enviroment agnostic logging library for javascript and typescript.
It's intended use case is in complex projects or ecosystems, that consist of multiple
packages, some of which may be libraries that are used across multiple enviroments, like
Node.js and the browser. `just-log` provides a way of managing log messages in these cases
in a consistent way, where the applications control the logging implementation for everything,
including the libraries they depend on.

## Usage in libraries

To use `just-log` in a library, just import the `@just-log/core` package, preferably create a logging namespace
for your library, and log away!

```ts
import log from "@just-log/core";

const logger = log.sub("my-library");
logger.trace("Trace message");
logger.debug("Debug message");
logger.info("Info message");
logger.warning("Warning message");
logger.error("Error message");
```

## Usage in applications

In order to see log messages in your application, you will have to enable a log writer.
Currently supported are:
- [`@just-log/node`](https://www.npmjs.com/package/@just-log/node)
- [`@just-log/browser`](https://www.npmjs.com/package/@just-log/browser)

Simply initialize your log writer like this:

```ts
import log from "@just-log/core";
import initLogWriter from "@just-log/node"

initLogWriter()

const logger = log.sub("my-application");
logger.trace("Trace message");
logger.debug("Debug message");
logger.info("Info message");
logger.warning("Warning message");
logger.error("Error message");
```

> # Important
> Log messages that are sent before the log writer has been initialized will not be displayed!
