import { FRONTEND_URL, JWT_SECRET } from "../../../config/config.service.js";
import {
  BadRequestException,
  emailEmitter,
  NotFoundException,
  UnauthorizedException,
} from "../../Common/index.js";
import {
  create,
  createOne,
  deleteOne,
  find,
  findAll,
  findById,
  findOne,
} from "../../DB/database.repository.js";
import { Workspace } from "./../../DB/Models/workspace.model.js";
import jwt from "jsonwebtoken";
import { WorkspaceInvite } from "./../../DB/Models/workspace-invite.model.js";
import { recordActivity } from "../../Middleware/recordActivity.js";
import { User } from "../../DB/Models/user.model.js";
import { Project } from './../../DB/Models/project.model.js';

export const createWorkSpace = async (inputs, userId) => {
  const { name, description, color } = inputs;
  const workspace = await create({
    model: Workspace,
    data: [
      {
        name,
        description,
        color,
        owner: userId,
        members: [
          {
            user: userId,
            role: "owner",
            joinedAt: new Date(),
          },
        ],
      },
    ],
  });
  return workspace;
};

export const getWorkSpaces = async (id) => {
  const workspaces = await find({
    model: Workspace,
    filter: {
      "members.user": id,
    },
    options: {
      sort: { createdAt: -1 },
    },
  });
  return workspaces;
};

export const inviteUserToWorkspace = async (req) => {
  const { email, role } = req.body;
  const { workspaceId } = req.params;
  const workspace = await findById({
    model: Workspace,
    id: workspaceId,
  });
  if (!workspace) {
    throw NotFoundException({
      message: "Workspace not found",
    });
  }
  const userMemberInfo = workspace.members.find((member) => {
    return member.user.toString() === req.user._id.toString();
  });
  if (!userMemberInfo || !["admin", "owner"].includes(userMemberInfo.role)) {
    throw UnauthorizedException({
      message: "You are not authorized to invite members to this workspace",
    });
  }
  const existingUser = await findOne({
    model: User,
    filter: {
      email,
    },
  });
  if (!existingUser) {
    throw NotFoundException({
      message: "User not found",
    });
  }
  const isMember = workspace.members.some((member) => {
    member.user.toString() === existingUser._id.toString();
  });
  if (isMember) {
    throw BadRequestException({
      message: "User already a member of this workspace",
    });
  }

  const isInvited = await findOne({
    model: WorkspaceInvite,
    filter: {
      user: existingUser._id,
      workspaceId: workspaceId,
    },
  });
  if (isInvited && isInvited.expiresAt > new Date()) {
    throw BadRequestException({
      message: "User already invited to this workspace please check your mail",
    });
  }

  if (isInvited && isInvited.expiresAt < new Date()) {
    await deleteOne({
      model: WorkspaceInvite,
      filter: {
        _id: isInvited._id,
      },
    });
  }

  const inviteToken = jwt.sign(
    {
      user: existingUser._id,
      workspaceId,
      role: role || "member",
    },
    JWT_SECRET,
    {
      expiresIn: "10d",
    },
  );
  console.log(inviteToken);
  await createOne({
    model: WorkspaceInvite,
    data: {
      user: existingUser._id,
      workspaceId,
      token: inviteToken,
      role: role || "member",
      expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    },
  });
  const invitationLink = `${FRONTEND_URL}/workspace-invite/${workspace._id}?tk=${inviteToken}`;
  emailEmitter.emit("workspace-invite", {
    to: email,
    subject: `You have been invited to join ${workspace.name} workspace`,
    code: invitationLink,
    title: `You have been invited to join ${workspace.name} workspace`,
  });

  return;
};

export const acceptInviteByToken = async ({ token }) => {
  const decoded = jwt.verify(token, JWT_SECRET);
  const { user, workspaceId, role } = decoded;
  const workspace = await findById({
    model: Workspace,
    id: workspaceId,
  });

  if (!workspace) {
    throw NotFoundException({
      message: "Workspace Not Found!",
    });
  }
  const isMember = workspace.members.some((member) => {
    member.user.toString() === user.toString();
  });

  if (isMember) {
    throw BadRequestException({
      message: "User already a member of this workspace",
    });
  }
  const invite = await findOne({
    model: WorkspaceInvite,
    options: {
      user,
      workspaceId,
    },
  });
  if (!invite) {
    throw NotFoundException({
      message: "Invitation not found",
    });
  }
  if (invite.expiresAt < new Date()) {
    throw BadRequestException({
      message: "Invitation has Expired",
    });
  }
  workspace.members.push({
    user,
    role: role || "member",
    joinedAt: new Date(),
  });

  await workspace.save();
  await Promise.all([
    deleteOne({
      model: WorkspaceInvite,
      options: {
        _id: invite._id,
      },
    }),
    recordActivity(user, "joined_workspace", "Workspace", workspaceId, {
      description: `Joined ${workspace.name} workspace`,
    }),
  ]);
  return;
};

export const acceptGenerateInvite = async ({ workspaceId }, userId) => {
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
    member.user.toString() === userId.toString();
  });
  if (isMember) {
    throw BadRequestException({
      message: "You are already a member of this workspace",
    });
  }
  workspace.members.push({
    user: userId,
    role: "member",
    joinedAt: new Date(),
  });
  await workspace.save();
  await recordActivity(userId, "joined_workspace", "Workspace", workspaceId, {
    description: `Joined ${workspace.name} workspace`,
  });
  return;
};

export const getWorkspaceDetails = async ({ workspaceId }) => {
  const workspace = await findById({
    model: Workspace,
    id: workspaceId,
    populate: [{ path: "members.user", select: "name email profilePicture" }],
  });

  if (!workspace) {
    throw NotFoundException({
      message: "Workspace not found",
    });
  }
  return workspace;
};

export const getWorkspaceProjects = async ({ workspaceId }, userId) => {
  const workspace = await findOne({
    model: Workspace,
    filter: {
      _id: workspaceId,
      "members.user": userId,
    },
    options: {populate:{ path: "members.user", select: "name email profilePicture" }},
  });
  if(!workspace){
    throw NotFoundException({
        message:"Workspace not found"
    })
  }
  const projects = await find({
  model: Project,
  filter: {
    workspace: workspaceId,
    isArchived: false,
    members: { $elemMatch: { user: userId } },
  },
  populate: [{ path: "tasks", select: "status" }],
  sort: { createdAt: -1 },
});
console.log(projects);
  return {projects, workspace}
};

export const getWorkspaceStats = async({workspaceId},userId)=>{
    const workspace = await findById({
    model: Workspace,
    id: workspaceId,
  });

  if(!workspace){
    throw NotFoundException({
      message:"Workspace not found"
    })
  }

  const isMember = workspace.members.some((member)=>{
    return member.user.toString() === userId.toString()
  })
  if(!isMember){
    throw UnauthorizedException({
      message:"You are not a member of this workspace"
    })
  }

  const [totalProjects, projects]= await Promise.all([
    Project.countDocuments({workspace:workspaceId}),
    find({
      model:Project,
      filter:{workspace:workspaceId},
      populate:[{
        path:"tasks", 
        select:"title status dueDate project updateAt isArchived priority"
      }],
      sort:{createdAt:-1}
    })
  ]);

  const totalTasks = projects.reduce((acc, project)=>{
    return acc+project.tasks.length;
  },0);

  const totalProjectInProgress = projects.filter((project)=>{
    project.status ==="In Progress"
  }).length

  const totalTaskCompleted = projects.reduce((acc,project)=>{
    return (acc+project.tasks.filter((task)=>task.status === "Done").length)
  },0)

  const totalTaskToDo = projects.reduce((acc,project)=>{
    return (acc+project.tasks.filter((task)=>task.status==="To Do").length)
  },0);

  const totalTaskInProgress = projects.reduce((acc,project)=>{
    return (acc+ project.tasks.filter((task)=>task.status==="In Progress").length)
  },0)

  const tasks= projects.flatMap((project)=>project.tasks);

  const upcomingTasks = tasks.filter((task)=>{
    const taskDate = new Date(task.dueDate);
      const today = new Date();
      return (
        taskDate > today &&
        taskDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      );
  })

    const taskTrendsData = [
      { name: "Sun", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Mon", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Tue", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Wed", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Thu", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Fri", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Sat", completed: 0, inProgress: 0, toDo: 0 },
    ];

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();


    for (const project of projects) {
      for (const task in project.tasks) {
        const taskDate = new Date(task.updatedAt);

        const dayInDate = last7Days.findIndex(
          (date) =>
            date.getDate() === taskDate.getDate() &&
            date.getMonth() === taskDate.getMonth() &&
            date.getFullYear() === taskDate.getFullYear()
        );

        if (dayInDate !== -1) {
          const dayName = last7Days[dayInDate].toLocaleDateString("en-US", {
            weekday: "short",
          });

          const dayData = taskTrendsData.find((day) => day.name === dayName);

          if (dayData) {
            switch (task.status) {
              case "Done":
                dayData.completed++;
                break;
              case "In Progress":
                dayData.inProgress++;
                break;
              case "To Do":
                dayData.toDo++;
                break;
            }
          }
        }
      }
    }

    // get project status distribution
    const projectStatusData = [
      { name: "Completed", value: 0, color: "#10b981" },
      { name: "In Progress", value: 0, color: "#3b82f6" },
      { name: "Planning", value: 0, color: "#f59e0b" },
    ];

    for (const project of projects) {
      switch (project.status) {
        case "Completed":
          projectStatusData[0].value++;
          break;
        case "In Progress":
          projectStatusData[1].value++;
          break;
        case "Planning":
          projectStatusData[2].value++;
          break;
      }
    }

    // Task priority distribution
    const taskPriorityData = [
      { name: "High", value: 0, color: "#ef4444" },
      { name: "Medium", value: 0, color: "#f59e0b" },
      { name: "Low", value: 0, color: "#6b7280" },
    ];

    for (const task of tasks) {
      switch (task.priority) {
        case "High":
          taskPriorityData[0].value++;
          break;
        case "Medium":
          taskPriorityData[1].value++;
          break;
        case "Low":
          taskPriorityData[2].value++;
          break;
      }
    }

    const workspaceProductivityData = [];

    for (const project of projects) {
      const projectTask = tasks.filter(
        (task) => task.project.toString() === project._id.toString()
      );

      const completedTask = projectTask.filter(
        (task) => task.status === "Done" && task.isArchived === false
      );

      workspaceProductivityData.push({
        name: project.title,
        completed: completedTask.length,
        total: projectTask.length,
      });
    }

    const stats = {
      totalProjects,
      totalTasks,
      totalProjectInProgress,
      totalTaskCompleted,
      totalTaskToDo,
      totalTaskInProgress,
    };

    return {
      stats,
      taskTrendsData,
      projectStatusData,
      taskPriorityData,
      workspaceProductivityData,
      upcomingTasks,
      recentProjects: projects.slice(0, 5),
    }
}