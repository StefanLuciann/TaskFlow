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

// In-App Notification Sender (replace with actual notification logic)
class InAppNotificationSender implements INotificationSender {
  private notificationService: INotificationService;

  constructor(notificationService: INotificationService) {
    this.notificationService = notificationService;
  }

  public sendNotification(title: string, dueDate: Date): void {
    const message = `Task Deadline: ${title} - Due on ${dueDate.toLocaleDateString()}`;
    this.notificationService.showNotification(message);
  }
}

// Notification Manager
class NotificationManager {
  private dbContext: any; // Replace with your actual database interaction logic

  constructor(dbContext: any) {
    this.dbContext = dbContext;
  }

  public checkForTaskNotifications(): void {
    const notificationThreshold = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    const tasks = this.dbContext.getTasks() // Replace with your database query logic
      .filter(task => task.hasNotification && (
        !task.notificationSentAt ||
        Date.now() - task.notificationSentAt.getTime() >= notificationThreshold
      ));

    tasks.forEach(task => {
      const notificationSender = new InAppNotificationSender(new NotificationService());
      notificationSender.sendNotification(task.title, task.dueDate);

      task.hasNotification = false; // Reset notification flag after sending
      task.notificationSentAt = new Date(); // Update sent timestamp
      this.dbContext.updateTask(task); // Replace with your database update logic
    });
  }
}

// Example Usage (assuming you have a database interaction layer)
const notificationManager = new NotificationManager({
  getTasks: () => /* Your logic to fetch tasks from database */,
  updateTask: (task) => /* Your logic to update task in database */
});

notificationManager.checkForTaskNotifications();
