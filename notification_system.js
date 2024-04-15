const mysql = require('mysql2/promise');

// Task Model (assuming a data structure)
const Task = function(id, title, dueDate, hasNotification, notificationSentAt) {
  this.id = id;
  this.title = title;
  this.dueDate = dueDate;
  this.hasNotification = hasNotification;
  this.notificationSentAt = notificationSentAt;
};

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
    console.log(`Notification: ${message}`); // Simulate notification for now, replacing with the current sending logic?
    this.notificationService.showNotification(message);
  }
}

// Notification Manager
class NotificationManager {
  private pool: mysql.Pool;

  constructor(config: mysql.PoolOptions) {
    this.pool = mysql.createPool(config);
  }

  public async checkForTaskNotifications(): Promise<void> {
    const notificationThreshold = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    const connection = await this.pool.getConnection();
    try {
      const [tasks] = await connection.query(
        `SELECT * FROM tasks WHERE hasNotification = ? AND (notificationSentAt IS NULL OR notificationSentAt + INTERVAL ? SECOND < NOW())`,
        [true, notificationThreshold / 1000]
      );

      for (const task of tasks) {
        const notificationSender = new InAppNotificationSender(new NotificationService());
        notificationSender.sendNotification(task.title, task.dueDate);

        await connection.query('UPDATE tasks SET hasNotification = ?, notificationSentAt = NOW() WHERE id = ?', [
          false,
          task.id,
        ]);
      }
    } catch (error) {
      console.error('Error checking for task notifications:', error);
    } finally {
      connection.release();
    }
  }
}

//MySQL connection details
const config = {
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'your_database_name',
};

const notificationManager = new NotificationManager(config);

notificationManager.checkForTaskNotifications()
  .then(() => console.log('Checked for task notifications'))
  .catch(error => console.error('Error running notification manager:', error));
