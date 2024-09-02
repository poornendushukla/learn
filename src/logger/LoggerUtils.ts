import Logger from './Logger';

type LoggerConfig = {
	prefix?: string;
};
export function getLoggerInstance({ prefix }: LoggerConfig) {
	if (prefix) {
		Logger.setPublisherPrefix(prefix);
	}
	return Logger.getInstance();
}
