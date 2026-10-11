import { Alert as NativeAlert, Platform } from 'react-native';

export const Alert: Pick<typeof NativeAlert, 'alert'> = {
  alert(title, message, buttons, options) {
    if (Platform.OS !== 'web') {
      NativeAlert.alert(title, message, buttons, options);
      return;
    }

    const text = [title, message].filter(Boolean).join('\n\n');
    const action = buttons?.find((button) => button.style !== 'cancel');
    const cancel = buttons?.find((button) => button.style === 'cancel');
    if (action && cancel) {
      const confirmed = window.confirm(`${text}\n\n${action.text || 'Tiếp tục'}?`);
      (confirmed ? action : cancel).onPress?.();
    } else {
      window.alert(text);
      action?.onPress?.();
    }
  },
};
