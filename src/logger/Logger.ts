export abstract class BasePublisher {
	protected abstract prefix: string | undefined;
	abstract publish(level: string, message: string, flowId?: string, context?: any): Promise<void>;
	abstract setPrefix(prefix: string): void;
	downloadLogs(filename = 'logs.json') {}
}
/**
 * Default Console Publisher, consumer can create a custom and set publisher
 */
type SessionLogsType = {
	timeStamp: number;
	level: string;
	message: string;
	context: any;
};
class ConsolePublisher extends BasePublisher {
	protected prefix: string = 'CONSOLE_LOGGER';
	private maxLogs: number = 1000;
	private store: Storage;
	private logStorageId = 'IDQA_CONSOLE_LOGS';
	private currentFlowId: string | null = null;

	constructor() {
		super();
		this.store = window.sessionStorage;
	}
	private log(level: string, formattedMessage: string) {
		switch (level) {
			case 'INFO':
				console.info(formattedMessage);
				break;
			case 'WARN':
				console.warn(formattedMessage);
				break;
			case 'ERROR':
				console.error(formattedMessage);
				break;
			default:
				console.log(formattedMessage);
		}
	}
	private getLogs(): SessionLogsType[] {
		const sessionStorage = this.store.getItem(this.logStorageId);
		return sessionStorage ? JSON.parse(sessionStorage) : null;
	}
	private setLogs(logs: SessionLogsType[]) {
		this.store.setItem(this.logStorageId, JSON.stringify(logs));
	}
	public setPrefix(prefix: string) {
		this.prefix = prefix;
	}
	public downloadLogs(filename = 'logs.json') {
		const logs = this.getLogs();
		if (logs.length == 0) {
			console.error('no logs stored till now, please try again later');
			return;
		}
		const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async publish(level: string, message: string, context?: any, flowId?: string): Promise<void> {
		if ((this.currentFlowId !== flowId || !this.currentFlowId) && flowId) {
			if (this.currentFlowId) {
				console.groupEnd();
			}
			this.currentFlowId = flowId;
			console.groupCollapsed(`Flow: ${flowId}`, `color:gray`);
		}
		let formattedMessage = `[${this.prefix}] [${Date.now().toString()}] ${level}: ${message} `;
		context ? (formattedMessage = `${formattedMessage}${JSON.stringify(context || {})}`) : null;
		this.log(level, formattedMessage);
		const logs = this.getLogs() || [];
		logs.push({ timeStamp: Date.now(), level, message, context: JSON.stringify(context || {}) });
		if (logs.length >= this.maxLogs) {
			/**
			 * remove the first in case of overflow
			 */
			logs.shift();
		}
		this.setLogs(logs);
	}
}

class Logger {
	private static instance: Logger;
	private publisher: BasePublisher;
	private flowId: string | null = null;
	private constructor() {
		/**
		 * Defaults to our console publisher
		 */
		this.publisher = new ConsolePublisher();
	}
	public static getInstance(): Logger {
		if (!Logger.instance) {
			Logger.instance = new Logger();
			Logger.instance.info('Logger initialzed');
		}
		return Logger.instance;
	}
	public static setPublisherPrefix(prefix: string) {
		let instance: Logger = this.instance;
		if (!instance) {
			instance = this.getInstance();
		}
		instance.info(`publisher prefix set to ${prefix}`);
		instance.publisher.setPrefix(prefix);
	}
	public static downloadLogs(fileName: string) {
		this.instance.publisher.downloadLogs(fileName);
	}
	public startFlow(flowId: string) {
		this.flowId = `${flowId} ${Date.now().toString()}`;
	}
	public addPublisher(publisher: BasePublisher) {
		this.publisher = publisher;
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public async log(level: string, message: string, context?: any): Promise<void> {
		await this.publisher.publish(level, message, context, this.flowId);
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public info(message: string, context?: any) {
		this.log('INFO', message, context);
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public warn(message: string, context?: any) {
		this.log('WARN', message, context);
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public error(message: string, context?: any) {
		this.log('ERROR', message, context);
	}
}

export default Logger;
