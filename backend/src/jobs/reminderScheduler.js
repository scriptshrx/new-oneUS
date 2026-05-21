const { processDueReminders } = require('../services/reminderService');

const INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

const startReminderScheduler = () => {
  console.log('Starting reminder SMS scheduler (every 30 minutes)');

  // Run once on startup after a short delay
  setTimeout(() => {
    processDueReminders().catch((err) => {
      console.error('Initial reminder job failed:', err);
    });
  }, 5000);

  setInterval(() => {
    processDueReminders().catch((err) => {
      console.error('Reminder job failed:', err);
    });
  }, INTERVAL_MS);
};

module.exports = { startReminderScheduler };
