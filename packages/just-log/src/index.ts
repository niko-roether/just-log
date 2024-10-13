export const enum LogLevel {
	TRACE = 5,
	DEBUG = 4,
	INFO = 3,
	WARNING = 2,
	ERROR = 1,
	NONE = 0,
}

export function logLevelName(level: LogLevel): string {
	switch (level) {
		case LogLevel.TRACE:
			return "trace";
		case LogLevel.DEBUG:
			return "debug";
		case LogLevel.INFO:
			return "info";
		case LogLevel.WARNING:
			return "warning";
		case LogLevel.ERROR:
			return "error";
		case LogLevel.NONE:
			return "none";
	}
}

export interface LogMessage {
	level: LogLevel,
	source?: string,
	timestamp: Date,
	text: string
}

export interface LogWriter {
	write(message: LogMessage): void;
}

let writer: LogWriter | null = null;

export function registerLogWriter(w: LogWriter) {
	writer = w;
}

const IDENTIFIER_REGEX = /^[a-z0-9_-]+$/i;

function createSourceString(source: string[]): string {
	const mapped = source.map((s) => {
		if (IDENTIFIER_REGEX.test(s)) return s;
		return `[${JSON.stringify(s)}]`;
	});
	return mapped.join("::");
}

export class Logger {
	private readonly source: string[];
	private readonly sourceString?: string;

	constructor(...source: string[]) {
		this.source = source;
		if (source.length > 0) this.sourceString = createSourceString(source);
	}

	public sub(...source: string[]): Logger {
		return new Logger(...this.source, ...source);
	}

	public log(level: LogLevel, message: string): void {
		if (level == LogLevel.NONE) {
			throw new Error(`Cannot write log messages of level NONE`);
		}
		writer?.write({
			level,
			text: message,
			timestamp: new Date(),
			source: this.sourceString,
		});
	}

	public trace(message: string): void {
		this.log(LogLevel.TRACE, message);
	}

	public debug(message: string): void {
		this.log(LogLevel.DEBUG, message);
	}

	public info(message: string): void {
		this.log(LogLevel.INFO, message);
	}

	public warning(message: string): void {
		this.log(LogLevel.WARNING, message);
	}

	public error(message: string): void {
		this.log(LogLevel.ERROR, message);
	}
}

const DEFAULT_LOGGER = new Logger();

export default DEFAULT_LOGGER;
