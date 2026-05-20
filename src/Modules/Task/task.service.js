import { create, findAll, findById } from "../../DB/database.repository.js";
import { Project } from "./../../DB/Models/project.model.js";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "./../../Common/response/error.response.js";
import { Workspace } from "./../../DB/Models/workspace.model.js";
import { Task } from "../../DB/Models/task.model.js";
import { recordActivity } from "../../Middleware/recordActivity.js";
import { Comment } from './../../DB/Models/comment.model.js';
import { ActivityLog } from "../../DB/Models/activity.model.js";

export const createTask = async (req) => {
  const { projectId } = req.params;
  const { title, description, status, priority, dueDate, assignees } = req.body;

  const project = await findById({
    model: Project,
    id: projectId,
  });
  if (!project) {
    throw NotFoundException({
      message: "Project not found",
    });
  }
  const workspace = await findById({
    model: Workspace,
    id: project.workspace,
  });
  const isMember = workspace.members.some(
    (member) =>{ return member.user.toString() === req.user._id.toString()},
  );

  if (!isMember) {
    throw UnauthorizedException({
      message: "You are not a member of this workspace",
    });
  }

  const newTask = await create({
    model: Task,
    data: {
      title,
      description,
      status,
      priority,
      dueDate,
      assignees,
      project: projectId,
      createdBy: req.user._id,
    },
  });

  project.tasks.push(newTask._id);
  await project.save();
  return newTask;
};

export const getMyTasks = async (userId) => {
  const tasks = await findAll({
    model: Task,
    filter: { assignees: { $in: [userId] } },
    select: "title status createdAt",
    sort: { createdAt: -1 },
    options: {
      populate: { path: "project", select: "title workspace" },
    },
  });

  return tasks;
};

export const getTaskById = async (taskId) => {
  const task = await findById({
    model: Task,
    id: taskId,
    populate: [
      { path: "assignees", select: "username firstName lastName profilePicture" },
      { path: "watchers", select: "username firstName lastName profilePicture" },
    ],
  });

  if (!task) {
    throw NotFoundException({
      message: "Task not found",
    });
  }

  const project = await findById({
    model: Project,
    id: task.project,
    populate: [{ path: "members.user", select: "username firstName lastName profilePicture" }],
  });

  return { task, project };
};

export const updateTaskTitle = async (taskId, title, userId) => {
  const task = await findById({
    model: Task,
    id: taskId,
  });
  if (!task) {
    throw NotFoundException({
      message: "Task not found",
    });
  }
  const project = await findById({
    model: Project,
    id: task.project,
  });
  if (!project) {
    throw NotFoundException({
      message: "Project not found",
    });
  }
  const isMember = project.members.some((member) => {
    return member.user.toString() === userId.toString();
  });

  if (!isMember) {
    throw UnauthorizedException({
      message: "You are not a member of this project",
    });
  }
  const oldTitle = task.title;
  task.title = title;
  await task.save();
  await recordActivity(userId, "update_task", "Task", taskId, {
    description: `updated task title from ${oldTitle} to ${title}`,
  });
  return task;
};

export const updateTaskDescription = async (taskId, description, userId) => {
  const task = await findById({
    model: Task,
    id: taskId,
  });
  if (!task) {
    throw NotFoundException({
      message: "Task not found",
    });
  }
  const project = await findById({
    model: Project,
    id: task.project,
  });
  if (!project) {
    throw NotFoundException({
      message: "Project not found",
    });
  }
  const isMember = project.members.some((member) => {
    return member.user.toString() === userId.toString();
  });

  if (!isMember) {
    throw UnauthorizedException({
      message: "You are not a member of this project",
    });
  }
  const oldDescription =
    task.description.substring(0, 60) + (task.description.length > 60 ? "..." : "");
  const newDescription =
    description.substring(0, 60) + (description.length > 60 ? "..." : "");

  task.description = description;
  await task.save();
  await recordActivity(userId, "updated_task", "Task", taskId, {
    description: `updated task description from ${oldDescription} to ${newDescription}`,
  });
  return task;
};

export const updateTaskStatus = async (taskId, status, userId) => {
  const task = await findById({
    model: Task,
    id: taskId,
  });
  if (!task) {
    throw NotFoundException({
      message: "Task not found",
    });
  }
  const project = await findById({
    model: Project,
    id: task.project,
  });
  if (!project) {
    throw NotFoundException({
      message: "Project not found",
    });
  }
  const isMember = project.members.some((member) => {
    return member.user.toString() === userId.toString();
  });

  if (!isMember) {
    throw UnauthorizedException({
      message: "You are not a member of this project",
    });
  }
  const oldStatus = task.status;

  task.status = status;
  await task.save();
  await recordActivity(userId, "updated_task", "Task", taskId, {
    description: `updated task status from ${oldStatus} to ${status}`,
  });
  return task;
};

export const updateTaskAssignees = async (taskId, assignees, userId) => {
  const task = await findById({
    model: Task,
    id: taskId,
  });
  if (!task) {
    throw NotFoundException({
      message: "Task not found",
    });
  }
  const project = await findById({
    model: Project,
    id: task.project,
  });
  if (!project) {
    throw NotFoundException({
      message: "Project not found",
    });
  }
  const isMember = project.members.some((member) => {
    return member.user.toString() === userId.toString();
  });

  if (!isMember) {
    throw UnauthorizedException({
      message: "You are not a member of this project",
    });
  }
  const oldAssignees = task.assignees;

  task.assignees = assignees;
  await task.save();
  await recordActivity(userId, "updated_task", "Task", taskId, {
    description: `updated task assignees from ${oldAssignees.length} to ${assignees.length}`,
  });
  return task;
};

export const updateTaskPriority = async (taskId, priority, userId) => {
  const task = await findById({
    model: Task,
    id: taskId,
  });
  if (!task) {
    throw NotFoundException({
      message: "Task not found",
    });
  }
  const project = await findById({
    model: Project,
    id: task.project,
  });
  if (!project) {
    throw NotFoundException({
      message: "Project not found",
    });
  }
  const isMember = project.members.some((member) => {
    return member.user.toString() === userId.toString();
  });

  if (!isMember) {
    throw UnauthorizedException({
      message: "You are not a member of this project",
    });
  }
  const oldPriority = task.priority;

  task.priority = priority;
  await task.save();

  await recordActivity(userId, "updated_task", "Task", taskId, {
    description: `updated task priority from ${oldPriority} to ${priority}`,
  });
  return task;
};

export const addSubTask = async (taskId, title, userId) => {
  const task = await findById({
    model: Task,
    id: taskId,
  });
  if (!task) {
    throw NotFoundException({
      message: "Task not found",
    });
  }
  const project = await findById({
    model: Project,
    id: task.project,
  });
  if (!project) {
    throw NotFoundException({
      message: "Project not found",
    });
  }
  const isMember = project.members.some((member) => {
    return member.user.toString() === userId.toString();
  });

  if (!isMember) {
    throw UnauthorizedException({
      message: "You are not a member of this project",
    });
  }
  const newSubTask = {
    title,
    completed: false,
  };

  task.subtasks.push(newSubTask);
  await task.save();

  await recordActivity(userId, "created_subtask", "Task", taskId, {
    description: `created subtask ${title}`,
  });
  return task;
};

export const addComment = async (taskId, text, userId) => {
  const task = await findById({
    model: Task,
    id: taskId,
  });
  if (!task) {
    throw NotFoundException({
      message: "Task not found",
    });
  }
  const project = await findById({
    model: Project,
    id: task.project,
  });
  if (!project) {
    throw NotFoundException({
      message: "Project not found",
    });
  }
  const isMember = project.members.some((member) => {
    return member.user.toString() === userId.toString();
  });

  if (!isMember) {
    throw UnauthorizedException({
      message: "You are not a member of this project",
    });
  }

  const newComment = await create({
    model: Comment,
    data: {
      text,
      task: taskId,
      author: userId,
    },
  });

  task.comments.push(newComment._id);
  await task.save();

  await recordActivity(userId, "added_comment", "Task", taskId, {
    description: `added comment ${
      text.substring(0, 50) + (text.length > 50 ? "..." : "")
    }`,
  });
  return task;
};

export const getCommentsByTaskId = async (taskId) => {
  const comments = await findAll({
    model: Comment,
    filter: { task: taskId },
    sort: { createdAt: -1 },
    options: {
      populate: [{ path: "author", select: "username firstName lastName profilePicture" }],
    },
  });

  return comments;
};

export const watchTask = async (taskId, userId) => {
  const task = await findById({
    model: Task,
    id: taskId,
  });

  if (!task) {
    throw NotFoundException({
      message: "Task not found",
    });
  }

  const project = await findById({
    model: Project,
    id: task.project,
  });

  if (!project) {
    throw NotFoundException({
      message: "Project not found",
    });
  }

  const isMember = project.members.some((member) => {
    return member.user.toString() === userId.toString();
  });

  if (!isMember) {
    throw UnauthorizedException({
      message: "You are not a member of this project",
    });
  }

  const isWatching = task.watchers.includes(userId);

  if (!isWatching) {
    task.watchers.push(userId);
  } else {
    task.watchers = task.watchers.filter((watcher) => {
      return watcher.toString() !== userId.toString();
    });
  }

  await task.save();

  return task;
};

export const achievedTask = async (taskId, userId) => {
  const task = await findById({
    model: Task,
    id: taskId,
  });
  if (!task) {
    throw NotFoundException({
      message: "Task not found",
    });
  }

  const project = await findById({
    model: Project,
    id: task.project,
  });

  if (!project) {
    throw NotFoundException({
      message: "Project not found",
    });
  }

  const isMember = project.members.some((member) => {
    return member.user.toString() === userId.toString();
  });

  if (!isMember) {
    throw UnauthorizedException({
      message: "You are not a member of this project",
    });
  }

  const isAchieved = task.isAchieved;
  task.isAchieved = !isAchieved;
  await task.save();

  await recordActivity(userId, "updated_task", "Task", taskId, {
    description: `${isAchieved ? "unachieved" : "achieved"} task ${task.title}`,
  });

  return task;
};

export const getActivityByResourceId = async (resourceId) => {
  const activity = await findAll({
    model: ActivityLog,
    filter: { resourceId },
    sort: { createdAt: -1 },
    options: {
      populate: [{ path: "user", select: "username firstName lastName profilePicture" }],
    },
  });

  return activity;
};


export const updateSubTask = async(taskId, subTaskId,completed,userId)=>{
    const task = await findById({
        model:Task,
        id:taskId
    })
    const subTask = task.subtasks.find((subTask)=>{
        return subTask._id.toString()===subTaskId
    })

    if(!subTask){
        throw NotFoundException({
            message:"Subtask not found"
        })
    }

    subTask.completed = completed
    await task.save()

    await recordActivity(userId, "updated_subtask", "Task", taskId, {
      description: `updated subtask ${subTask.title}`,
    });
    return task
}