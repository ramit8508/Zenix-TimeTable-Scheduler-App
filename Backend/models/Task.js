const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    taskName: {
      type: String,
      required: [true, 'Please provide a task name'],
      trim: true,
      maxlength: [100, 'Task name cannot be more than 100 characters'],
    },
    duration: {
      type: Number,
      required: [true, 'Please provide task duration'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    category: {
      type: String,
      default: 'General',
    },
    notes: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
taskSchema.index({ userId: 1, date: 1 });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
