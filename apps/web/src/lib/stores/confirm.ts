import { writable } from 'svelte/store';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

function createConfirmStore() {
  const { subscribe, set, update } = writable<{
    isOpen: boolean;
    options: ConfirmOptions | null;
    resolve: ((value: boolean) => void) | null;
  }>({
    isOpen: false,
    options: null,
    resolve: null
  });

  return {
    subscribe,
    confirm: (options: ConfirmOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        set({ isOpen: true, options, resolve });
      });
    },
    alert: (options: ConfirmOptions): Promise<void> => {
      return new Promise((resolve) => {
        set({ isOpen: true, options: { ...options, cancelText: undefined, confirmText: 'OK' }, resolve: () => resolve() });
      });
    },
    handleConfirm: () => {
      update(state => {
        if (state.resolve) state.resolve(true);
        return { isOpen: false, options: null, resolve: null };
      });
    },
    handleCancel: () => {
      update(state => {
        if (state.resolve) state.resolve(false);
        return { isOpen: false, options: null, resolve: null };
      });
    }
  };
}

export const confirmStore = createConfirmStore();
