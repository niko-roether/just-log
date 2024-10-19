import log from "@just-log/core";
import initLogWriter from "@just-log/node"

initLogWriter();

const logger = log.sub("example");

logger.trace("trace message");
logger.debug("debug message");
logger.info("info message");
logger.warning("warning message");
logger.error("error message", new Error("This is an error object"));
