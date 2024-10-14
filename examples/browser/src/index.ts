import log from "@just-log/core";
import initLog from "@just-log/browser";

initLog();

const logger = log.sub("example");

logger.trace("trace message");
logger.debug("debug message");
logger.info("info message");
logger.warning("warning message");
logger.error("error message");
