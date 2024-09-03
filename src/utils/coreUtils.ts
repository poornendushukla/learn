export type AsyncPollingConfig<PayloadType> = { shopOnVisibilityChange?: boolean; interval: number; onChange: (payload: PayloadType) => void };
export abstract class AsyncPolling<PayloadType> {
	private timer?: ReturnType<typeof setInterval>;
	private paused = false;
	private isPreviousCallActive = false;
	constructor(private config: AsyncPollingConfig<PayloadType>) {}
	async start(): Promise<void> {
		document.addEventListener('visibilitychange', this.onVisibilityChange);
		this.timer = setInterval(async () => {
			if ((this.paused && this.config.shopOnVisibilityChange === true) || this.isPreviousCallActive) {
				return;
			}
			this.isPreviousCallActive = true;
			const data = await this.poll().finally(() => (this.isPreviousCallActive = false));
			this.config.onChange(data);
		}, this.config.interval);
	}
	stop(): void {
		document.removeEventListener('visibilitychange', this.onVisibilityChange);
		if (this.timer !== undefined) {
			clearInterval(this.timer);
		}
	}
	private onVisibilityChange(): void {
		this.paused = document.visibilityState === 'hidden';
	}
	abstract poll(): Promise<PayloadType>;
}