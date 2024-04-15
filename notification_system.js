const mongoose = require('mongoose');

// Task Schema (Mongoose model)
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  dueDate: { type: Date, required: true },
  hasNotification: { type: Boolean, default: false },
  notificationSentAt: { type: Date },
});

const Task = mongoose.model('Task', taskSchema);

// Interface for Notification Service
interface INotificationService {
  showNotification(message: string): void;
}

// In-App Notification Sender (simulate notification for now)
class InAppNotificationSender implements INotificationSender {
  private notificationService: INotificationService;

  constructor(notificationService: INotificationService) {
    this.notificationService = notificationService;
  }

  public sendNotification(title: string, dueDate: Date): void {
    const message = `Task Deadline: ${title} - Due on ${dueDate.toLocaleDateString()}`;
    console.log(`Notification: ${message}`); // Simulate notification for now, replacing with the actual sending logic?
    this.notificationService.showNotification(message);
  }
}

// Notification Manager
class NotificationManager {
  private db: mongoose.Connection;

  constructor(mongoUrl: string) {
    this.db = mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
  }

  public async checkForTaskNotifications(): Promise<void> {
    const notificationThreshold = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    try {
      const tasks = await Task.find({
        hasNotification: true,
        $or: [
          { notificationSentAt: null },
          { $where: `this.notificationSentAt.getTime() + ${notificationThreshold} < Date.now()` },
        ],
      });

      tasks.forEach(async (task) => {
        const notificationSender = new InAppNotificationSender(new NotificationService());
        notificationSender.sendNotification(task.title, task.dueDate);

        task.hasNotification = false; // Reset notification flag after sending
        task.notificationSentAt = new Date(); // Update sent timestamp
        await task.save();
      });
    } catch (error) {
      console.error('Error checking for task notifications:', error);
    }
  }
}

// Example Usage
const mongoUrl = 'mongodb://localhost:27017/your_database_name'; // Replacing with MongoDB connection string
const notificationManager = new NotificationManager(mongoUrl);

notificationManager.checkForTaskNotifications()
  .then(() => console.log('Checked for task notifications'))
  .catch(error => console.error('Error running notification manager:', error));
