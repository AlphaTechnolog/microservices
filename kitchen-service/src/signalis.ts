export class Signalis {
    private signals: {
        callback: (...args: any[]) => void;
        key: string;
    }[] = [];

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

    // Improved emit method with handler removal
    public emit<V>(signal: string, ...args: V[]) {
        this.signals = this.signals.filter(handler => {
            const { key, callback } = handler;
            if (key === signal) {
                callback(...args);
                return false; // Remove the handler after calling it
            }
            return true;
        });
    }

    // New method to disconnect a specific handler
    public disconnect<V>(signal: string, callback: (...args: V[]) => void) {
        this.signals = this.signals.filter(handler => {
            return handler.key !== signal || handler.callback !== callback;
        });
    }
}
