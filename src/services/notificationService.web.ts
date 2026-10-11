// Native scheduled reminders are unavailable in the web app.
export const notificationService = {
  async requestPermissions(): Promise<boolean> {
    return false;
  },
  async scheduleBookingReminder(): Promise<string | null> {
    return null;
  },
  async cancelBookingReminder(): Promise<void> {},
};
