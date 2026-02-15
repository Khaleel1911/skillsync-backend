const Project = require("../models/Project");
const User = require("../models/User");
const sendResponse = require("../utils/responseHandler");

const createProject = async (req, res, next) => {
  try {
    const project = await Project.create({
      ...req.body,
      owner: req.user._id,
    });

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { projectsCreated: project._id },
    });

    return sendResponse(res, 201, "Project created", { project });
  } catch (error) {
    return next(error);
  }
};

const listProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      projectStatus: "Open",
      isVisible: true,
    })
      .populate("owner", "fullName profileImage")
      .sort({ createdAt: -1 });

    const visibleProjects = projects.filter((project) => project.hasOpenRole());
    return sendResponse(res, 200, "Projects fetched", { projects: visibleProjects });
  } catch (error) {
    return next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "fullName email phoneNumber profileImage")
      .populate("members.user", "fullName email phoneNumber profileImage");

    if (!project) {
      return sendResponse(res, 404, "Project not found", {});
    }

    const isOwner = req.user && project.owner._id.toString() === req.user._id.toString();
    const isMember = req.user
      ? project.members.some((member) => member.user._id.toString() === req.user._id.toString())
      : false;

    if (!isOwner && !isMember) {
      if (project.owner) {
        project.owner.email = undefined;
        project.owner.phoneNumber = undefined;
      }
      project.members.forEach((member) => {
        if (member.user) {
          member.user.email = undefined;
          member.user.phoneNumber = undefined;
        }
      });
    }

    return sendResponse(res, 200, "Project fetched", { project });
  } catch (error) {
    return next(error);
  }
};

const matchProjects = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return sendResponse(res, 404, "User not found", {});
    }

    const knownSkills = (user.skillsKnown || []).map((skill) => skill.name).filter(Boolean);
    const projects = await Project.find({
      projectStatus: "Open",
      isVisible: true,
    }).populate("owner", "fullName profileImage");

    const matched = projects.filter((project) => {
      if (!project.hasOpenRole()) {
        return false;
      }
      return project.requiredRoles.some((role) =>
        role.requiredSkills.some((skill) => knownSkills.includes(skill))
      );
    });

    return sendResponse(res, 200, "Matched projects fetched", { projects: matched });
  } catch (error) {
    return next(error);
  }
};

const joinProject = async (req, res, next) => {
  try {
    const { roleName } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) {
      return sendResponse(res, 404, "Project not found", {});
    }
    if (!project.isVisible || project.projectStatus !== "Open") {
      return sendResponse(res, 400, "Project is not open for joining", {});
    }
    if (project.owner.toString() === req.user._id.toString()) {
      return sendResponse(res, 400, "Owner cannot apply to own project", {});
    }

    const role = project.requiredRoles.find((item) => item.roleName === roleName);
    if (!role) {
      return sendResponse(res, 400, "Role not found", {});
    }
    if (role.filledPositions >= role.numberOfOpenings) {
      return sendResponse(res, 400, "Role already filled", {});
    }

    const duplicateRequest = project.joinRequests.find(
      (request) =>
        request.user.toString() === req.user._id.toString() &&
        request.roleName === roleName &&
        request.status !== "Rejected"
    );
    const alreadyMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (duplicateRequest || alreadyMember) {
      return sendResponse(res, 400, "Duplicate join request", {});
    }

    project.joinRequests.push({ user: req.user._id, roleName });
    await project.save();

    return sendResponse(res, 200, "Join request submitted", { projectId: project._id });
  } catch (error) {
    return next(error);
  }
};

const respondToJoinRequest = async (req, res, next) => {
  try {
    const { requestId, action } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) {
      return sendResponse(res, 404, "Project not found", {});
    }
    if (project.owner.toString() !== req.user._id.toString()) {
      return sendResponse(res, 403, "Only owner can respond", {});
    }

    const request = project.joinRequests.id(requestId);
    if (!request || request.status !== "Pending") {
      return sendResponse(res, 400, "Invalid join request", {});
    }

    if (action === "accept") {
      const role = project.requiredRoles.find((item) => item.roleName === request.roleName);
      if (!role || role.filledPositions >= role.numberOfOpenings) {
        return sendResponse(res, 400, "Role already filled", {});
      }

      request.status = "Accepted";
      project.members.push({ user: request.user, roleName: request.roleName });
      role.filledPositions += 1;
      project.updateStatusForRoles();

      await User.findByIdAndUpdate(request.user, {
        $addToSet: { projectsJoined: project._id },
      });
    } else if (action === "reject") {
      request.status = "Rejected";
    } else {
      return sendResponse(res, 400, "Invalid action", {});
    }

    await project.save();
    return sendResponse(res, 200, "Request updated", { projectId: project._id });
  } catch (error) {
    return next(error);
  }
};

const completeProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return sendResponse(res, 404, "Project not found", {});
    }
    if (project.owner.toString() !== req.user._id.toString()) {
      return sendResponse(res, 403, "Only owner can complete", {});
    }

    project.projectStatus = "Completed";
    project.isVisible = false;
    await project.save();

    return sendResponse(res, 200, "Project completed", { projectId: project._id });
  } catch (error) {
    return next(error);
  }
};

const archiveProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return sendResponse(res, 404, "Project not found", {});
    }
    if (project.owner.toString() !== req.user._id.toString()) {
      return sendResponse(res, 403, "Only owner can archive", {});
    }

    project.projectStatus = "Archived";
    project.isVisible = false;
    await project.save();

    return sendResponse(res, 200, "Project archived", { projectId: project._id });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createProject,
  listProjects,
  matchProjects,
  getProjectById,
  joinProject,
  respondToJoinRequest,
  completeProject,
  archiveProject,
};

