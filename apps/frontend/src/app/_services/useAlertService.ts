import { create } from 'zustand';

export { useAlertService };

// alert state store
const alertStore = create<IAlertStore>(() => ({}));

function useAlertService(): IAlertService {
  const { alert } = alertStore();

  return {
    alert,
    success: (message: string, showAfterRedirect = false) => {
      const type = 'Sucess';
      alertStore.setState({
        alert: { type, message, showAfterRedirect }
      });
    },
    error: (message: string, showAfterRedirect = false) => {
      const type = 'Error';
      alertStore.setState({
        alert: { type, message, showAfterRedirect }
      });
    },
    info: (message: string, showAfterRedirect = false) => {
      const type = 'Info';
      alertStore.setState({
        alert: { type, message, showAfterRedirect }
      });
    },
    clear: () => {
      alertStore.setState(state => {
        let alert = state.alert;

        // if showAfterRedirect is true the alert is kept for
        // one route change (e.g. after successful registration)
        if (alert?.showAfterRedirect) {
          alert.showAfterRedirect = false;
        } else {
          alert = undefined;
        }

        return { alert };
      });
    }
  }
}

// interfaces
interface IAlert {
  type: string,
  message: string,
  showAfterRedirect: boolean
}

interface IAlertStore {
  alert?: IAlert
}

interface IAlertService extends IAlertStore {
  success: (message: string, showAfterRedirect?: boolean) => void,
  error: (message: string, showAfterRedirect?: boolean) => void,
  info: (message: string, showAfterRedirect?: boolean) => void,
  clear: () => void,
}