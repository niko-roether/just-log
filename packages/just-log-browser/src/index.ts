import { LogLevel, LogMessage, LogWriter, registerLogWriter } from "@just-log/core";

interface WriterConfig {
	maxLevel?: LogLevel;
	filters?: Record<string, LogLevel>
}

type LogHandler = (...args: string[]) => void;

interface LogPart {
	text: string;
	color?: string;
	weight?: string;
}

function formatLogLevel(level: LogLevel): LogPart[] {
	switch (level) {
		case LogLevel.TRACE:
			return [{ text: "TRACE", color: "silver", weight: "bold" }];
		case LogLevel.DEBUG:
			return [{ text: "DEBUG", color: "cyan", weight: "bold" }];
		case LogLevel.INFO:
			return [{ text: "INFO", color: "lime", weight: "bold" }];
		case LogLevel.WARNING:
			return [{ text: "WARNING", color: "yellow", weight: "bold" }];
		case LogLevel.ERROR:
			return [{ text: "ERROR", color: "red", weight: "bold" }];
		case LogLevel.NONE:
			return [];
	}
}

function formatPrefix(message: LogMessage): LogPart[] {
	const parts: LogPart[] = [{ text: "[", color: "gray" }];
	parts.push(...formatLogLevel(message.level));
	if (message.source) {
		parts.push({ text: " " });
		parts.push({ text: message.source, color: "silver" });
	}
	parts.push({ text: "]", color: "gray" });
	return parts;
}

function formatMessage(message: LogMessage): LogPart[] {
	const parts: LogPart[] = [];
	parts.push(...formatPrefix(message));
	parts.push({ text: " " });
	parts.push({ text: message.text });
	return parts;
}

function compileLogParts(parts: LogPart[]): string[] {
	let template = "";
	const styles: string[] = [];
	for (const part of parts) {
		styles.push(`color: ${part.color ?? "currentcolor"}; font-weight: ${part.weight ?? "normal"}`);
		template += `%c${part.text}`;
	}
	return [template, ...styles];
}

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

class BrowserWriter implements LogWriter {
	constructor(private config: WriterConfig) { }

	private shouldShowMessage(message: LogMessage) {
		let maxLevel = this.config.maxLevel;
		for (const [matcher, filterMaxLevel] of Object.entries(this.config.filters ?? {})) {
			if (message.source?.startsWith(matcher)) maxLevel = filterMaxLevel;
		}
		return !maxLevel || message.level <= maxLevel;
	}

	public write(message: LogMessage): void {
		if (!this.shouldShowMessage(message)) return;
		const messageArgs = compileLogParts(formatMessage(message));
		const handler = getLogHandler(message.level);
		console.log(JSON.stringify(messageArgs));
		handler(...messageArgs);
	}
}

function mergeConfig(base: WriterConfig, ...configs: WriterConfig[]): WriterConfig {
	const merge = configs.pop();
	if (!merge) return base;
	const merged = {
		maxLevel: merge.maxLevel ?? base.maxLevel,
		filters: Object.assign(base.filters ?? {}, merge.filters ?? {})
	}
	return mergeConfig(merged, ...configs);
}

export type InitConfig = WriterConfig

const DEFAULT_CONFIG: InitConfig = {
	maxLevel: LogLevel.DEBUG
}

export default function init(config?: InitConfig) {
	const computedConfig = mergeConfig(DEFAULT_CONFIG, config ?? {});
	const logWriter = new BrowserWriter(computedConfig);
	registerLogWriter(logWriter);
}
