
const Task = function(id, title, dueDate, hasNotification, notificationSentAt) {
  this.id = id;
  this.title = title;
  this.dueDate = dueDate;
  this.hasNotification = hasNotification;
  this.notificationSentAt = notificationSentAt;
};

interface INotificationService {
  showNotification(message: string): void;
}

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
  private dbContext: any;
  constructor(dbContext: any) {
    this.dbContext = dbContext;
  }

  public checkForTaskNotifications(): void {
    const notificationThreshold = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    const tasks = this.dbContext.getTasks() 
      .filter(task => task.hasNotification && (
        !task.notificationSentAt ||
        Date.now() - task.notificationSentAt.getTime() >= notificationThreshold
      ));

    tasks.forEach(task => {
      const notificationSender = new InAppNotificationSender(new NotificationService());
      notificationSender.sendNotification(task.title, task.dueDate);

      task.hasNotification = false; 
      task.notificationSentAt = new Date(); 
      this.dbContext.updateTask(task); 
    });
  }
}
const notificationManager = new NotificationManager({
  getTasks: () => ,
  updateTask: (task) => 
});

notificationManager.checkForTaskNotifications();
