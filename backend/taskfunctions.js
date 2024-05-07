// taskfunctions.js

const Task = require('..Task/models/Task');


async function searchTasks(query) {
  try {
    const tasks = await Task.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ]
    });
    return tasks;
  } catch (error) {
    console.error('Error searching tasks:', error);
    throw error;
  }
}

async function filterTasks(filters) {
  try {
    const tasks = await Task.find(filters);
    return tasks;
  } catch (error) {
    console.error('Error filtering tasks:', error);
    throw error;
  }
}

async function sendNotification(username, message) {
  // Implement your notification logic here
  console.log(`Sending notification to ${username}: ${message}`);
}

module.exports = { searchTasks, filterTasks, sendNotification };
