# just-log-node

A `just-log` log writer for Node.js environments. See [`@just-log/core`](https://www.npmjs.com/package/@just-log/core)
for more information.

## Basic usage

Initialize the log writer during startup of your application like this:

```ts
import initLogwriter from "@just-log/node"

initLogWriter();
```

> # Important
> Log messages that are sent before the log writer has been initialized will not be displayed!

## Configuration

The log writer can be configured at runtime using an environment variable, and using an options
object passed to the init function.

### Using the `LOG_LEVEL` enviroment variable

Unless configured otherwise, the default log level is `info`. Override it to one of `trace`, `debug`, `info`, `warning`,
`error`, or `none`, by setting the environment variable:

```sh
LOG_LEVEL=debug npm run start
```

If you use multiple logging namespaces, or have librares that also use `@just-log/core`,
you can also set the log level individually per namespace like this:

```sh
LOG_LEVEL=debug,some_library=warning,some_library::sub_namespace=none npm run start
```

### Passing options to the init function

Environment variables will always take precendence, but you can configure default behavior
by passing options to the `initLogWriter` function. The init function also takes some configuration
options that can't be configured via environment variables.

```ts
import { LogLevel } from "@just-log/core"
import initLogwriter from "@just-log/node"

initLogWriter({
    // Set a custom environment variable to use instead of `LOG_LEVEL`
    envVarName: "MYAPP_LOG_LEVEL",

    // Set the default log level when the environment variable is not set. Defaults to LogLevel.INFO
    maxLevel: LogLevel.WARNING,

    // Set a list of custom log levels for different logging namespaces. Later rules have precedence.
    filters: [
        {
            // The namespace to match
            matcher: "some_library",
            // The log level for this namespace
            maxLevel: LogLevel.WARNING
        }
    ]
})
```
