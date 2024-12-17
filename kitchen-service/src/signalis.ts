export class Signalis {
    constructor(
        private signals: {
            callback: (...args: any[]) => void;
            key: string;
        }[] = []
    ) {}

    public connect<V>(signal: string, callback: (...args: V[]) => void) {
        this.signals.push({
            callback,
            key: signal,
        });
    }

    public waitFor<V>(signal: string): Promise<V> {
        return new Promise((resolve) => {
            this.connect(signal, resolve);
        });
    }

    // TODO: Better way to remove a handler.
    public emit<V>(signal: string, ...args: V[]) {
        for (let i = 0; i < this.signals.length; ++i) {
            const handler = this.signals[i];
            const { key, callback } = handler;
            if (key !== signal) continue;
            callback(...args);
            this.signals[i].callback = () => {};
        }
    }
}
