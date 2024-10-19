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
	text: string,
	error?: Error
}

export interface LogWriter {
	write(message: LogMessage): void;
}

declare global {
	// eslint-disable-next-line no-var
	var __justLogWriter: LogWriter | null;
}

export function registerLogWriter(w: LogWriter) {
	globalThis.__justLogWriter = w;
}

function logWriterWrite(message: LogMessage): void {
	globalThis.__justLogWriter?.write(message);
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

	public log(level: LogLevel, text: string): void {
		const message = this.createMessage(level, text);
		logWriterWrite(message);
	}

	public trace(text: string): void {
		this.log(LogLevel.TRACE, text);
	}

	public debug(text: string): void {
		this.log(LogLevel.DEBUG, text);
	}

	public info(text: string): void {
		this.log(LogLevel.INFO, text);
	}

	public warning(text: string): void {
		this.log(LogLevel.WARNING, text);
	}

	public error(text: string, error: unknown = undefined): void {
		let message;
		if (error instanceof Error) {
			message = this.createMessage(LogLevel.ERROR, text, error);
		} else {
			message = this.createMessage(LogLevel.ERROR, text);
		}
		logWriterWrite(message);
	}

	private createMessage(level: LogLevel, text: string, error?: Error): LogMessage {
		if (level == LogLevel.NONE) {
			throw new Error(`Cannot write log messages of level NONE`);
		}
		return {
			level,
			text: text,
			timestamp: new Date(),
			source: this.sourceString,
			error
		};
	}
}

const DEFAULT_LOGGER = new Logger();

export default DEFAULT_LOGGER;
