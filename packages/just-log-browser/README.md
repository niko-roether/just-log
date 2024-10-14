# just-log-browser

A `just-log` log writer for browser environments. See [`@just-log/core`](https://www.npmjs.com/package/@just-log/core)
for more information.

## Basic usage

Initialize the log writer during load of your website like this:

```ts
import initLogwriter from "@just-log/browser"

initLogWriter();
```

> [!IMPORTANT]
> Log messages that are sent before the log writer has been initialized will not be displayed!

## Configuration

You can configure the behavior of the log writer by passing options to the `initLogWriter` function.

```ts
import { LogLevel } from "@just-log/core"
import initLogwriter from "@just-log/browser"

initLogWriter({
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
