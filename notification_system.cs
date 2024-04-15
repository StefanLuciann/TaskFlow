public class Task
{
    public int Id { get; set; }
    public string Title { get; set; }
    public DateTime DueDate { get; set; }
    public bool HasNotification { get; set; }
    public DateTime? NotificationSentAt { get; set; }
}

public class NotificationService : INotificationService
{
    public void ShowNotification(string message)
    {
        // Replace with your actual pop-up implementation (consider using a library/framework)
        System.Windows.Forms.MessageBox.Show(message);
    }
}

public interface INotificationService
{
    void ShowNotification(string message);
}

public class InAppNotificationSender : INotificationSender
{
    private readonly INotificationService _notificationService; // Dependency injection

    public InAppNotificationSender(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    public void SendNotification(string title, DateTime dueDate)
    {
        // Simulate a basic in-app notification (replace with your actual implementation)
        _notificationService.ShowNotification($"Task Deadline: {title} - Due on {dueDate.ToString("yyyy-MM-dd")}");
    }
}

public class NotificationManager
{
    private readonly DbContext _dbContext; // Assuming you have a DbContext for database access

    public NotificationManager(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public void CheckForTaskNotifications()
    {
        var tasks = _dbContext.Tasks
            .Where(t => t.HasNotification && !t.NotificationSentAt.HasValue ||
                (t.NotificationSentAt.HasValue && t.DueDate.Subtract(t.NotificationSentAt.Value).TotalHours >= 24))
            .ToList();

        foreach (var task in tasks)
        {
            var notificationService = new NotificationService();
            var notificationSender = new InAppNotificationSender(notificationService);
            notificationSender.SendNotification(task.Title, task.DueDate);

            task.HasNotification = false; // Reset notification flag after sending
            task.NotificationSentAt = DateTime.Now; // Update sent timestamp
        }

        _dbContext.SaveChanges(); // Save changes to the database
    }
}
