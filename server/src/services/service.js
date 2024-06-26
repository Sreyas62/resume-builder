// Import any required models here
// const Example = require('../models/example');
const { OAuth2Client } = require("google-auth-library");
// const jwt = require('jsonwebtoken');

const userData = require("../models/userModel");
const contactData = require("../models/contactModel");
const eduData = require("../models/eduModel");
const skillData = require("../models/skillModel");
const projectData = require("../models/projectModel");
const internData = require("../models/internModel");
const activityData = require("../models/activityModel");

const { v4: uuidv4 } = require("uuid");

// Define your service methods
exports.getExamples = async () => {
  return "value";
};

exports.signin = async (token) => {
  try {
    console.log("token", token);
    const requestOptions = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    };

    const response = await fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`,
      requestOptions
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    const { name, email, picture } = data;

    console.log("name", name, "email", email, "picture", picture);
    const user = await userData.findOne({ Email: email });
    let userid = user ? user.UserID : "";
    let resumeCount = user ? user.ResumeCount : 0;
    if (user) {
      console.log("User already exists");
    } else {
      userid = uuidv4();
      const newUser = new userData({
        UserID: userid,
        Name: name,
        Email: email,
        Picture: picture,
        ResumeCount: 0,
      });
      await newUser.save();
    }
    return {
      statusCode: 200,
      body: {
        message: "User signed in successfully",
        userid: userid,
        name: name,
        email: email,
        picture: picture,
        resumecount: resumeCount,
      },
    };
  } catch (error) {
    console.error("There was a problem with your fetch operation:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

exports.updateResumeCount = async (userid) => {
  try {
    const user = await userData.findOne({ UserID: userid });
    let resumeCount = user.ResumeCount;
    resumeCount += 1;
    await userData.findOneAndUpdate({ UserID: userid }, { ResumeCount: resumeCount });
    return {
      statusCode: 200,
      body: { message: "Resume count updated successfully" },
    };
  } catch (error) {
    console.error("There was a problem with your fetch operation:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

exports.CreateResume = async (details) => {
  try {
    console.log("details", details);

    const newContact = new contactData({
      UserID: details.userID,
      resumeID: details.resumeID,
      name: details.details.name,
      place: details.contact.place,
      state: details.contact.state,
      mobile: details.contact.mobile,
      email: details.contact.email,
      linkedin: details.contact.linkedin,
      github: details.contact.github,
    });
    await newContact.save();

    const educationDetails = Object.values(details.education).map((edu) => ({
      qualif: edu.qualif,
      institute: edu.institute,
      department: edu.department,
      cgpa: edu.cgpa,
    }));

    const newEdu = new eduData({
      UserID: details.userID,
      resumeID: details.resumeID,
      education: educationDetails,
    });

    await newEdu.save();

    const newSkill = new skillData({
      UserID: details.userID,
      resumeID: details.resumeID,
      technical: details.skills.technical,
      soft: details.skills.soft,
    });
    await newSkill.save();

    const newProjects = Object.values(details.projects).map((project) => ({
      title: project.title,
      description: project.description,
      techStack: project.techStack,
      link: project.link,
    }));

    const newProjectData = new projectData({
      UserID: details.userID,
      resumeID: details.resumeID,
      projects: newProjects,
    });

    await newProjectData.save();

    const newInternships = Object.values(details.internships).map(
      (internship) => ({
        company: internship.company,
        // role: internship.role,
        duration: internship.duration,
        description: internship.description,
      })
    );

    const newInternData = new internData({
      UserID: details.userID,
      resumeID: details.resumeID,
      internships: newInternships,
    });

    await newInternData.save();

    const newActivities = Object.values(details.extraCurricular).map(
      (activity) => ({
        name: activity.name,
        description: activity.description,
      })
    );

    const newActivityData = new activityData({
      UserID: details.userID,
      resumeID: details.resumeID,
      extraCurricular: newActivities,
    });

    await newActivityData.save();

    return {
      statusCode: 200,
      body: { message: "Resume created successfully" },
    };
  } catch (error) {
    console.error("There was a problem with your fetch operation:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

exports.viewResume = async (userid,resumeid) => {
  try {
    console.log("resumeid", resumeid);
    let contact = await contactData.findOne({ UserID: userid , resumeID: resumeid});
    details = {
      name: contact.name,
      email: contact.email,
    };
    contact = {
      place: contact.place,
      state: contact.state,
      mobile: contact.mobile,
      email: contact.email,
      linkedin: contact.linkedin,
      github: contact.github,
    };

    let eduDatas = await eduData.findOne({ UserID: userid , resumeID: resumeid});

    const education = {}; // Initialize an empty object
    
    eduDatas.education.forEach((ed, index) => {
      education[`ed${index + 1}`] = { // Assign to the education object using dynamic key
        qualif: ed.qualif,
        institute: ed.institute,
        department: ed.department,
        cgpa: ed.cgpa,
      };
    });

    let skills = await skillData.findOne({ UserID: userid , resumeID: resumeid});
    skills = {
      technical: skills.technical,
      soft: skills.soft,
    };

    let projectsData = await projectData.findOne({ UserID: userid , resumeID: resumeid});
    const projects = projectsData.projects.map((project, index) => ({
      [`project${index + 1}`]: {
        title: project.title,
        description: project.description,
        techStack: project.techStack,
        link: project.link,
      },
    }));

    let internshipsData = await internData.findOne({ UserID: userid , resumeID: resumeid});
    const internships = internshipsData.internships.map(
      (internship, index) => ({
        [`internships${index + 1}`]: {
          company: internship.company,
          role: internship.role,
          duration: internship.duration,
          description: internship.description,
        },
      })
    );

    let extraCurricularData = await activityData.findOne({ UserID: userid , resumeID: resumeid});
    const extraCurricular = extraCurricularData.extraCurricular.map(
      (activity, index) => ({
        [`activity${index + 1}`]: {
          name: activity.name,
          description: activity.description,
        },
      })
    );

    const resumeDetails = {
      userID: userid,
      resumeID: resumeid,
      details,
      contact,
      education,
      skills,
      projects: Object.assign({}, ...projects),
      internships: Object.assign({}, ...internships),
      extraCurricular: Object.assign({}, ...extraCurricular),
    };
    console.log("resumeDetails", resumeDetails)
    return resumeDetails;
  } catch (error) {
    console.error(error);
    return { error: "Internal Server Error" };
  }
};

exports.updateResume = async (userid, updateData) => {
  try {
    console.log("up data",updateData)
    console.log("up id",updateData.resumeID)
    await contactData.findOneAndUpdate({ UserID: userid,resumeID:updateData.resumeID }, updateData.details, {
      new: true,
      upsert: true,
    });
    await contactData.findOneAndUpdate({ UserID: userid ,resumeID:updateData.resumeID}, updateData.contact, {
      new: true,
      upsert: true,
    });
    await eduData.findOneAndUpdate({ UserID: userid ,resumeID:updateData.resumeID}, updateData.education, {
      new: true,
      upsert: true,
    });
    await skillData.findOneAndUpdate({ UserID: userid ,resumeID:updateData.resumeID}, updateData.skills, {
      new: true,
      upsert: true,
    });
    await projectData.findOneAndUpdate(
      { UserID: userid ,resumeID:updateData.resumeID},
      updateData.projects,
      { new: true, upsert: true }
    );
    await internData.findOneAndUpdate(
      { UserID: userid ,resumeID:updateData.resumeID},
      updateData.internships,
      { new: true, upsert: true }
    );
    await activityData.findOneAndUpdate(
      { UserID: userid,resumeID:updateData.resumeID },
      updateData.extraCurricular,
      { new: true, upsert: true }
    );
      console.log("Resume updated successfully");
    return { message: "Resume updated successfully" };
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "error updating resume" });
  }
};
