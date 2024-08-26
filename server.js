const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const bodyParser = require("body-parser");
require("dotenv").config();
const userSignUp = require("./model/userSignUpModel");
const employerSignUp = require("./model/employerSignUpModel");
const jobPostData = require("./model/JobPostDataModel");
const bookmark = require("./model/bookmarkModel");
const contactInfo = require("./model/contactInfoModel");
const applied = require("./model/appliedModel");
const qualification = require("./model/qualificationModel");

// middleware
const app = express();
app.use(
  cors({
    origin: "https://careercraze.vercel.app",
    optionsSuccessStatus: 200,
  })
);

app.use(bodyParser.json());
app.use("/files", express.static(path.join(__dirname, "files")));

// mongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => console.log("Connected to mongoDB"));

///////////////////////////////////////    For User    /////////////////////////////////////////////

const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

// userSignUp
app.post("/signup", async (req, res) => {
  console.log("request", req);
  const {
    userSignFullName,
    userSignEmail,
    userSignPassword,
    userSignConfirmPassword,
    userSignMobileNo,
  } = req.body;
  try {
    if (!emailPattern.test(userSignEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    const existingUser = await userSignUp.findOne({ userSignEmail });
    if (existingUser) {
      console.log(existingUser);
      return res.status(400).json({ message: "User already exists" });
    }
    if (
      userSignPassword &&
      userSignConfirmPassword &&
      userSignPassword === userSignConfirmPassword
    ) {
      console.log("alive");
      const hashedPassword = await bcrypt.hash(userSignPassword, 10);
      const hashedConfirmPassword = await bcrypt.hash(
        userSignConfirmPassword,
        10
      );
      const newUser = new userSignUp({
        userSignFullName,
        userSignEmail,
        userSignPassword: hashedPassword,
        userSignConfirmPassword: hashedConfirmPassword,
        userSignMobileNo,
      });
      console.log("newuser", newUser);
      await newUser.save();

      res.status(201).json({ message: " SignUp successful" });
    } else {
      console.log("Password does not match");
      return res.status(400).json({ message: "Password does not match" });
    }
  } catch (err) {
    console.error(err); // Log the error for debugging purposes
    res.status(500).json({ message: "server error" });
  }
});

// userLogin
app.post("/login", async (req, res) => {
  const { userLogEmail, userLogPassword } = req.body;
  console.log(userLogEmail, userLogPassword);
  try {
    const user = await userSignUp.findOne({ userSignEmail: userLogEmail });
    console.log("userdata", user);
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const passwordValid = await bcrypt.compare(
      userLogPassword,
      user.userSignPassword
    );
    if (!passwordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    console.log(token);
    res.status(200).json({ token });
  } catch (err) {
    res.status(400).json({ message: "server error" });
  }
});

// Middleware to check for token for authentication
const verifyTokenUser = (req, res, next) => {
  console.log("Request headers:", req.headers);
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    console.log("No Authorization header present");
    return res.status(404).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Extracted token:", token);
  console.log("Running verifyToken middleware");

  if (!token) {
    return res.status(404).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("Token verification error:", err);
      return res.status(401).json({ message: "Failed to authenticate token" });
    }
    req.userId = decoded.userId;
    next();
  });
};

// getting data of particular user using token
app.get("/userdata", verifyTokenUser, async (req, res) => {
  try {
    console.log("User ID from token:", req.userId);
    const user = await userSignUp.findById(req.userId);
    console.log("User found:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.log("Server error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// bookmark posting
app.post("/bookmark", async (req, res) => {
  const { bookmarkId } = req.body;

  try {
    // Create a new Bookmark document with the received bookmarkId
    const newBookmark = new bookmark({ bookmarkId });

    // Save the new Bookmark document to MongoDB
    await newBookmark.save();

    // Send a success response
    res.status(201).json({ message: "Bookmark saved successfully" });
  } catch (err) {
    // Handle any errors
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/getBookMark", async (req, res) => {
  try {
    const bookmarks = await bookmark.find({});
    res.status(200).json(bookmarks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
});

// Example route to remove a bookmark by ID
app.delete("/bookmark/:id", async (req, res) => {
  const bookmarkId = req.params.id;
  console.log("id of book:", bookmarkId);

  try {
    // Use Mongoose to find and remove the bookmark by ID
    const deletedBookmark = await bookmark.findOneAndDelete({
      bookmarkId: bookmarkId,
    });

    if (!deletedBookmark) {
      return res.status(404).json({ message: "Bookmark not found" });
    }

    res.json({ message: "Bookmark deleted successfully" });
  } catch (error) {
    console.error("Error deleting bookmark:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// using multer to upload data

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

const upload = multer({ storage: storage });

// posting contact-info
app.put("/contact-info", upload.single("resume"), async (req, res) => {
  try {
    const {
      contactId,
      contactFullName,
      contactEmail,
      contactPhoneNo,
      contactCountry,
      contactStreet,
      contactCity,
      contactPincode,
    } = req.body;

    const fileName = req.file ? req.file.filename : "resume";
    console.log(fileName);
    

    // Validate required fields
    if (!contactId) {
      return res.status(400).json({ message: "contactId is required" });
    }

    const updateData = {
      contactId,
      contactFullName,
      contactEmail,
      contactPhoneNo,
      contactCountry,
      contactStreet,
      contactCity,
      contactPincode,
    };

    if (fileName) {
      updateData.resume = fileName;
    }

    const updatedContactInfo = await contactInfo.findOneAndUpdate(
      { contactId },
      updateData,
      { new: true, upsert: true }
    );
    res
      .status(201)
      .json({ message: "Contact updated successfully", updatedContactInfo });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// getting contact-info
app.get("/contact-data", async (req, res) => {
  try {
    const contactData = await contactInfo.find({});
    res.status(200).json(contactData);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
    console.error(err);
  }
});

app.post("/applied", async (req, res) => {
  const {
    applyId,
    applyCompanyName,
    applyJobTitle,
    applyFullName,
    applyEmail,
    applyMobileNo,
    applyResume,
    applyExperience,
    applyEducation,
    applySkills,
    applyLanguages,
    jobApplied,
    preferred,
    viewed,
    timeStamp,
  } = req.body;

  try {
    const newApplied = new applied({
      applyId,
      applyCompanyName,
      applyJobTitle,
      applyFullName,
      applyEmail,
      applyMobileNo,
      applyResume,
      applyExperience,
      applyEducation,
      applySkills,
      applyLanguages,
      jobApplied,
      preferred,
      viewed,
      timeStamp,
    });

    await newApplied.save();
    res.status(201).json({ message: "Applied successfully!" });
  } catch (err) {
    res.status(500).json({ message: "server error" });
    console.error(err);
  }
});

// posting qualification

app.put("/qualification", async (req, res) => {
  const { qualifyId, experience, education, skills, languages } = req.body;

  try {
    const updatedQualify = await qualification.findOneAndUpdate(
      { qualifyId },
      {
        qualifyId,
        experience,
        education,
        skills,
        languages,
      },
      { new: true, upsert: true }
    );

    if (updatedQualify) {
      res.status(200).json({ message: "Qualification updated successfully!" });
    } else {
      res.status(404).json({ message: "Qualification not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error" });
    console.error(err);
  }
});

app.get("/getQualify", async (req, res) => {
  try {
    const newQualifyData = await qualification.find({});
    console.log("newQualify", newQualifyData);
    res.status(200).json(newQualifyData);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
    console.error(err);
  }
});

app.put("/viewed/:id", async (req, res) => {
  const id = req.params.id;
  console.log("Viewed", id);

  const { viewed } = req.body;
  if (!viewed) {
    return res.status(400).json({ message: "Preferred field is required" });
  }
  try {
    const putApply = await applied.findOneAndUpdate(
      { _id: id },
      { $set: { viewed: viewed } },
      { new: true, upsert: false }
    );
    if (putApply) {
      res.status(200).json({ message: "Notification updated successfully!" });
    } else {
      res.status(404).json({ message: "Notification not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error" });
    console.error(err);
  }
});

/////////////////////////////////       For Employer       /////////////////////////////////

// Employer signup
app.post("/employersignup", async (req, res) => {
  const {
    employerSignName,
    employerSignCompanyName,
    designation,
    noOfEmployees,
    employerSignEmail,
    employerSignPassword,
    employerSignConfirmPassword,
    employerSignMobileNo,
  } = req.body;

  try {
    // Checking user already exist
    const existingUser = await employerSignUp.findOne({ employerSignEmail });
    if (existingUser) {
      console.log("User already exists");
      return res.status(400).json({ message: "User already exists" });
    }

    // Check if passwords match
    if (
      employerSignPassword &&
      employerSignConfirmPassword &&
      employerSignPassword === employerSignConfirmPassword
    ) {
      const hashedEmployPassword = await bcrypt.hash(employerSignPassword, 10);

      console.log("Password hashing success");
      const newEmployer = new employerSignUp({
        employerSignName,
        employerSignCompanyName,
        designation,
        noOfEmployees,
        employerSignEmail,
        employerSignPassword: hashedEmployPassword,
        employerSignConfirmPassword: hashedEmployPassword,
        employerSignMobileNo,
      });

      await newEmployer.save();
      console.log("New employer saved successfully");
      res.status(201).json({ message: "SignUp successful" });
    } else {
      console.log("Passwords do not match");
      res.status(400).json({ message: "Passwords do not match" });
    }
  } catch (err) {
    console.log("Server error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Employer Login

app.post("/employerlogin", async (req, res) => {
  const { employerLoginEmail, employerLoginPassword } = req.body;

  const employer = await employerSignUp.findOne({
    employerSignEmail: employerLoginEmail,
  });
  console.log("employer:", employer);
  if (!employer) return res.status(400).json({ message: "Invalid email" });

  const passwordValid = await bcrypt.compare(
    employerLoginPassword,
    employer.employerSignPassword
  );
  if (!passwordValid)
    return res.status(400).json({ message: "Invalid password" });

  const token = jwt.sign({ userId: employer._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.status(200).json({ token });
});

// Employer token verify and authentication

const verifyTokenEmploy = (req, res, next) => {
  console.log("Request headers:", req.headers);
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    console.log("No Authorization header present");
    return res.status(404).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Extracted token:", token);
  console.log("Running verifyToken middleware");

  if (!token) {
    return res.status(404).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("Token verification error:", err);
      return res.status(401).json({ message: "Failed to authenticate token" });
    }
    req.userId = decoded.userId;
    next();
  });
};

// getting data of particular user using token
app.get("/employdata", verifyTokenEmploy, async (req, res) => {
  try {
    console.log("User ID from token:", req.userId);
    const user = await employerSignUp.findById(req.userId);
    console.log("User found:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.log("Server error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

//posting job data to backend
app.post("/jobpost", verifyTokenEmploy, async (req, res) => {
  const {
    companyName,
    noOfEmployers,
    companyIndustry,
    companyDescription,
    jobTitle,
    JobOption,
    jobCity,
    jobArea,
    jobPincode,
    jobStreet,
    jobType,
    jobSchedule,
    jobMinValue,
    jobMaxValue,
    jobRate,
    jobSkill,
    isActive,
    timeStamp,
  } = req.body;

  const userId = req.userId;

  try {
    const newJobPost = {
      userId: userId,
      companyName,
      noOfEmployers,
      companyIndustry,
      companyDescription,
      jobTitle,
      JobOption,
      jobCity,
      jobArea,
      jobPincode,
      jobStreet,
      jobType,
      jobSchedule,
      jobMinValue,
      jobMaxValue,
      jobRate,
      jobSkill,
      isActive,
      timeStamp,
    };

    const jobPost = await jobPostData.findOneAndUpdate(
      {},
      { $push: { jobPosts: newJobPost } },
      { new: true, upsert: true }
    );
    res
      .status(201)
      .json({ message: "Job post created successfully", jobPost: jobPost });
  } catch (err) {
    console.error("Error creating job post:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// getting posted job data of particular user using token
app.get("/postedjob", async (req, res) => {
  try {
    const jobPosts = await jobPostData.find();
    res.status(200).json(jobPosts);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching job posts", error });
  }
});

// getting Applied data
app.get("/applied-data", async (req, res) => {
  try {
    const newApply = await applied.find({});
    res.status(200).json(newApply);
  } catch (err) {
    res.status(500).json({ message: "server error" });
  }
});

// Put the applied data
app.put("/prefer/:id", async (req, res) => {
  const id = req.params.id;
  console.log("Prefer", id);

  const { preferred } = req.body;
  if (!preferred) {
    return res.status(400).json({ message: "Preferred field is required" });
  }

  try {
    const putApply = await applied.findOneAndUpdate(
      { _id: id },
      { $set: { preferred: preferred } },
      { new: true, upsert: false }
    );
    if (putApply) {
      res
        .status(200)
        .json({ message: "Application updated successfully!", data: putApply });
    } else {
      res.status(404).json({ message: "Application not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error" });
    console.error(err);
  }
});

// Updating the isActive field of a specific job post
app.put("/jobEdit/:id", verifyTokenEmploy, async (req, res) => {
  const { id } = req.params; // Get the job post ID from the request parameters
  const { isActive } = req.body; // Get the new isActive value from the request body
  const userId = req.userId; // Get the user ID from the token

  try {
    // Find the job post by ID and update the isActive field
    const updatedJobPost = await jobPostData.findOneAndUpdate(
      { "jobPosts._id": id }, // Find the job post by ID and ensure it belongs to the user
      { $set: { "jobPosts.$.isActive": isActive } }, // Update the isActive field
      { new: true } // Return the updated document
    );

    if (!updatedJobPost) {
      return res.status(404).json({ message: "Job post not found" });
    }

    res.status(200).json({
      message: "Job post updated successfully",
      jobPost: updatedJobPost,
    });
  } catch (err) {
    console.error("Error updating job post:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint to get a file by name
app.get("/files/:name", (req, res) => {
  const { name } = req.params;
  console.log("Filename", name);

  // Construct the path to the file
  const filePath = path.join(__dirname, "files", name);

  // Send the file to the client
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("File not found:", err);
      res.status(404).send("File not found");
    }
  });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log("Server connected to", port));
