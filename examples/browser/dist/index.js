"use strict";
(() => {
  // ../../packages/just-log/dist/index.js
  var writer = null;
  function registerLogWriter(w) {
    writer = w;
  }
  var IDENTIFIER_REGEX = /^[a-z0-9_-]+$/i;
  function createSourceString(source) {
    const mapped = source.map((s) => {
      if (IDENTIFIER_REGEX.test(s))
        return s;
      return `[${JSON.stringify(s)}]`;
    });
    return mapped.join("::");
  }
  var Logger = class _Logger {
    source;
    sourceString;
    constructor(...source) {
      this.source = source;
      if (source.length > 0)
        this.sourceString = createSourceString(source);
    }
    sub(...source) {
      return new _Logger(...this.source, ...source);
    }
    log(level, message) {
      if (level == 0) {
        throw new Error(`Cannot write log messages of level NONE`);
      }
      writer?.write({
        level,
        text: message,
        timestamp: /* @__PURE__ */ new Date(),
        source: this.sourceString
      });
    }
    trace(message) {
      this.log(5, message);
    }
    debug(message) {
      this.log(4, message);
    }
    info(message) {
      this.log(3, message);
    }
    warning(message) {
      this.log(2, message);
    }
    error(message) {
      this.log(1, message);
    }
  };
  var DEFAULT_LOGGER = new Logger();
  var dist_default = DEFAULT_LOGGER;

  // ../../packages/just-log-browser/dist/index.js
  function formatLogLevel(level) {
    switch (level) {
      case 5:
        return [{ text: "TRACE", color: "silver", weight: "bold" }];
      case 4:
        return [{ text: "DEBUG", color: "cyan", weight: "bold" }];
      case 3:
        return [{ text: "INFO", color: "lime", weight: "bold" }];
      case 2:
        return [{ text: "WARNING", color: "yellow", weight: "bold" }];
      case 1:
        return [{ text: "ERROR", color: "red", weight: "bold" }];
      case 0:
        return [];
    }
  }
  function formatPrefix(message) {
    const parts = [{ text: "[", color: "gray" }];
    parts.push(...formatLogLevel(message.level));
    if (message.source) {
      parts.push({ text: " " });
      parts.push({ text: message.source, color: "silver" });
    }
    parts.push({ text: "]", color: "gray" });
    return parts;
  }
  function formatMessage(message) {
    const parts = [];
    parts.push(...formatPrefix(message));
    parts.push({ text: " " });
    parts.push({ text: message.text });
    return parts;
  }
  function compileLogParts(parts) {
    let template = "";
    const styles = [];
    for (const part of parts) {
      styles.push(`color: ${part.color ?? "currentcolor"}; font-weight: ${part.weight ?? "normal"}`);
      template += `%c${part.text}`;
    }
    return [template, ...styles];
  }
  function getLogHandler(level) {
    switch (level) {
      case 5:
      case 4:
        return console.debug;
      case 3:
        return console.info;
      case 2:
        return console.warn;
      case 1:
        return console.error;
      case 0:
        return () => void 0;
    }
  }
  var BrowserWriter = class {
    constructor(config) {
      this.config = config;
    }
    shouldShowMessage(message) {
      let maxLevel = this.config.maxLevel;
      for (const [matcher, filterMaxLevel] of Object.entries(this.config.filters ?? {})) {
        if (message.source?.startsWith(matcher))
          maxLevel = filterMaxLevel;
      }
      return !maxLevel || message.level <= maxLevel;
    }
    write(message) {
      if (!this.shouldShowMessage(message))
        return;
      const messageArgs = compileLogParts(formatMessage(message));
      const handler = getLogHandler(message.level);
      console.log(JSON.stringify(messageArgs));
      handler(...messageArgs);
    }
  };
  function mergeConfig(base, ...configs) {
    const merge = configs.pop();
    if (!merge)
      return base;
    const merged = {
      maxLevel: merge.maxLevel ?? base.maxLevel,
      filters: Object.assign(base.filters ?? {}, merge.filters ?? {})
    };
    return mergeConfig(merged, ...configs);
  }
  var DEFAULT_CONFIG = {
    maxLevel: 4
    /* LogLevel.DEBUG */
  };
  function init(config) {
    const computedConfig = mergeConfig(DEFAULT_CONFIG, config ?? {});
    const logWriter = new BrowserWriter(computedConfig);
    registerLogWriter(logWriter);
  }

  // src/index.ts
  init();
  var logger = dist_default.sub("example");
  logger.trace("trace message");
  logger.debug("debug message");
  logger.info("info message");
  logger.warning("warning message");
  logger.error("error message");
})();
