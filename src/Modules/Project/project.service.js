import {
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from "../../Common/index.js";
import { create, find, findById } from "../../DB/database.repository.js";
import { Workspace } from "./../../DB/Models/workspace.model.js";
import { Project } from "./../../DB/Models/project.model.js";
import { Task } from "./../../DB/Models/task.model.js";

export const createProject = async (req) => {
  const { workspaceId } = req.params;
  const { title, description, status, startDate, dueDate, tags, members } =
    req.body;

  const workspace = await findById({
    model: Workspace,
    id: workspaceId,
  });

  if (!workspace) {
    throw NotFoundException({
      message: "Workspace not found",
    });
  }
  const isMember = workspace.members.some((member) => {
    return member.user.toString() === req.user._id.toString();
  });
  if (!isMember) {
    throw ForbiddenException({
      message: "You are not a member of this workspace",
    });
  }

  const tagArray = tags ? tags.split(",") : [];
  const newProject = await create({
    model: Project,
    data: {
      title,
      description,
      status,
      startDate,
      dueDate,
      tags: tagArray,
      workspace: workspaceId,
      members: [
        { user: req.user._id, role: "manager" }, // 👈 ضيف الـ creator
        ...(members || []),
      ],
      createdBy: req.user._id,
    },
  });

  workspace.projects.push(newProject._id);
  await workspace.save();
  return newProject;
};

export const getProjectDetails = async ({ projectId }, userId) => {
  const project = await findById({
    model: Project,
    id: projectId,
    populate: {
      path: "members.user",
      select: "username firstName lastName profilePicture email",
    },
  });

  if (!project) {
    throw NotFoundException({
      message: "Project not found",
    });
  }

  const isMember = project.members.some((member) => {
    return member.user._id.toString() === userId.toString();
  });

  if (!isMember) {
    throw UnauthorizedException({
      message: "You are not a member of this project",
    });
  }

  return project;
};

export const getProjectTasks = async ({ projectId }, userId) => {
  const project = await findById({
    model: Project,
    id: projectId,
    populate: [
      {
        path: "members.user",
        select: "username firstName lastName profilePicture email",
      },
    ],
  });

  if (!project) {
    throw NotFoundException({
      message: "Project not found",
    });
  }

  // Check workspace membership
  const workspace = await findById({
    model: Workspace,
    id: project.workspace,
  });

  if (!workspace) {
    throw NotFoundException({
      message: "Workspace not found",
    });
  }

  const isWorkspaceMember = workspace.members.some(
    (member) => member.user.toString() === userId.toString(),
  );

  const isProjectMember = project.members.some(
    (member) => member.user._id.toString() === userId.toString(),
  );

  if (!isWorkspaceMember && !isProjectMember) {
    throw UnauthorizedException({
      message: "You are not authorized to access this project",
    });
  }

  const tasks = await find({
    model: Task,
    filter: {
      project: projectId,
      isAchieved: false,
    },
    populate: [
      {
        path: "assignees",
        select: "username firstName lastName profilePicture",
      },
    ],
    sort: { createdAt: -1 },
  });

  return { project, tasks };
};
