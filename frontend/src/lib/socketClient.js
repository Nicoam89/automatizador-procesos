const NO_OP = () => {};

export const io = () => {
  const listeners = new Map();

  return {
    on(event, callback) {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }

      listeners.get(event).add(callback);
    },
    off(event, callback) {
      const eventListeners = listeners.get(event);

      if (!eventListeners) {
        return;
      }

      eventListeners.delete(callback);
    },
    emit: NO_OP,
    connect: NO_OP,
    disconnect() {
      listeners.clear();
    },
  };
};
