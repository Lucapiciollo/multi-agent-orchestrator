/**
 * Registry globale per la cancellazione delle esecuzioni.
 * I provider controllano questo registry prima/durante l'esecuzione.
 */
const activeControllers = new Map<string, AbortController>();

export const CancellationRegistry = {
  register(execId: string): AbortController {
    const ctrl = new AbortController();
    activeControllers.set(execId, ctrl);
    return ctrl;
  },

  abort(execId: string): void {
    const ctrl = activeControllers.get(execId);
    if (ctrl) {
      ctrl.abort();
      activeControllers.delete(execId);
    }
  },

  getSignal(execId: string): AbortSignal | undefined {
    return activeControllers.get(execId)?.signal;
  },

  deregister(execId: string): void {
    activeControllers.delete(execId);
  }
};
