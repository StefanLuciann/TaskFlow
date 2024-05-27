const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Title is required'] },
  description: { type: String, required: true },
  priority: { type: Number, enum: [1, 2, 3], default: 1 }, // High = 1, Medium = 2, Low = 3
  deadline: { type: Date }, 
  progress: { type: String, enum: ['To-do', 'In progress', 'Completed'], default: 'To-do' },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Task', taskSchema); // Export the Task model
