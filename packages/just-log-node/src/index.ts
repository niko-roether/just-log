import pc from "picocolors";
import { LogLevel, LogMessage, LogWriter, registerLogWriter } from "@just-log/core";

interface WriterFilter {
	matcher: string,
	maxLevel: LogLevel,
}

interface WriterConfig {
	maxLevel?: LogLevel,
	filters?: WriterFilter[]
}

function formatLogLevel(level: LogLevel): string {
	switch (level) {
		case LogLevel.TRACE:
			return pc.bold(pc.white("TRACE"));
		case LogLevel.DEBUG:
			return pc.bold(pc.blueBright("DEBUG"));
		case LogLevel.INFO:
			return pc.bold(pc.greenBright("INFO"));
		case LogLevel.WARNING:
			return pc.bold(pc.yellowBright("WARNING"));
		case LogLevel.ERROR:
			return pc.bold(pc.redBright("ERROR"));
		case LogLevel.NONE:
			return "";
	}
}

function formatPrefix(message: LogMessage): string {
	const level = formatLogLevel(message.level);
	let prefixText = `[${level}`;
	if (message.source) prefixText += ` ${pc.white(message.source)}`;
	prefixText += "]";
	return pc.blackBright(prefixText);
}

function formatMessage(message: LogMessage): string {
	const prefix = formatPrefix(message);
	const messageText = `${prefix} ${message.text}`;
	switch (message.level) {
		case LogLevel.TRACE:
		case LogLevel.DEBUG:
			return pc.white(messageText);
		case LogLevel.INFO:
			return pc.whiteBright(messageText);
		case LogLevel.WARNING:
			return pc.yellow(messageText);
		case LogLevel.ERROR:
			return pc.red(messageText);
		case LogLevel.NONE:
			return "";
	}
}

type LogHandler = (message: string) => void;

function getLogHandler(level: LogLevel): LogHandler {
	switch (level) {
		case LogLevel.TRACE:
		case LogLevel.DEBUG:
			return console.debug;
		case LogLevel.INFO:
			return console.info;
		case LogLevel.WARNING:
			return console.warn;
		case LogLevel.ERROR:
			return console.error;
		case LogLevel.NONE:
			return () => undefined;
	}
}

class NodeWriter implements LogWriter {
	constructor(private config: WriterConfig) { }

	private shouldShowMessage(message: LogMessage) {
		let maxLevel = this.config.maxLevel;
		for (const filter of this.config.filters ?? []) {
			if (message.source?.startsWith(filter.matcher)) maxLevel = filter.maxLevel;
		}
		return !maxLevel || message.level <= maxLevel;
	}

	public write(message: LogMessage): void {
		if (!this.shouldShowMessage(message)) return;
		const messageText = formatMessage(message);
		const handler = getLogHandler(message.level);
		handler(messageText);
	}
}

const FILTER_RULE_REGEX = /^([^=]+)=(trace|debug|info|warning|error|none)$/i;

function parseLogLevel(string: string): LogLevel | null {
	switch (string.toLowerCase()) {
		case "trace":
			return LogLevel.TRACE;
		case "debug":
			return LogLevel.DEBUG;
		case "info":
			return LogLevel.INFO;
		case "warning":
			return LogLevel.WARNING;
		case "error":
			return LogLevel.ERROR;
		case "none":
			return LogLevel.NONE;
		default:
			return null;
	}
}

function parseFilterRule(string: string): WriterFilter | null {
	const result = FILTER_RULE_REGEX.exec(string);
	if (!result) return null;
	const maxLevel = parseLogLevel(result[2]);
	if (!maxLevel) return null;
	return {
		matcher: result[1],
		maxLevel
	}
}

function getEnvConfig(envVar: string): WriterConfig | null {
	const string = process.env[envVar];
	if (!string) return null;

	const config: WriterConfig = { filters: [] }
	const segments = string.split(",");
	for (const segment of segments) {
		const trimmedSegment = segment.trim();
		const level = parseLogLevel(trimmedSegment);
		if (level) {
			config.maxLevel = level;
			continue;
		}
		const filter = parseFilterRule(trimmedSegment);
		if (filter) {
			config.filters ??= [];
			config.filters.push(filter);
		}
	}

	return config;
}

export interface InitConfig extends WriterConfig {
	envVarName?: string;
}

function mergeConfig(base: WriterConfig, ...configs: WriterConfig[]): WriterConfig {
	const merge = configs.pop();
	if (!merge) return base;
	const merged = {
		maxLevel: merge.maxLevel ?? base.maxLevel,
		filters: [...(base.filters ?? []), ...(merge.filters ?? [])]
	}
	return mergeConfig(merged, ...configs);
}

const DEFAULT_ENV_VAR_NAME = "LOG_LEVEL";
const DEFAULT_CONFIG: InitConfig = {
	maxLevel: LogLevel.INFO
}

export default function initLogWriter(config?: InitConfig) {
	const envConfig = getEnvConfig(config?.envVarName ?? DEFAULT_ENV_VAR_NAME);
	const computedConfig = mergeConfig(DEFAULT_CONFIG, config ?? {}, envConfig ?? {});
	const logWriter = new NodeWriter(computedConfig);
	registerLogWriter(logWriter);
}
