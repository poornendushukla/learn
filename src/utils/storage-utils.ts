
const STORAGE_NAMESPACE = 'namespace-hash';
class StorageAdapter {
	private appStorageKey: string = v5('namespace', STORAGE_NAMESPACE);
	constructor(private store: Storage) {}
	/**
	 * Returns value of key is available in storage.
	 * @param {string} key
	 */
	public get<T>(key: string): T {
		const sessionContext = this.store.getItem(this.appStorageKey);
		const contextObj = sessionContext ? JSON.parse(sessionContext) : {};
		return contextObj[key];
	}
	/**
	 * Save key and its value in the storage.
	 * @param {string} key
	 * @param {string} value
	 */
	public set<T>(key: string, value: T): T {
		const savedSessionContext = this.store.getItem(this.appStorageKey);
		const sessionContext = savedSessionContext ? JSON.parse(savedSessionContext) : {};
		sessionContext[key] = value;
		this.store.setItem(this.appStorageKey, JSON.stringify(sessionContext));
		return value;
	}
}

export const LocalStorage = new StorageAdapter(window.localStorage);

export const SessionStorage = new StorageAdapter(window.sessionStorage);
