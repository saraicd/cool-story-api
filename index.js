require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const StoryEntry = require("./models/StoryEntry");
const Story = require("./models/Story");
const { validateAccessCode } = require("./middleware/authMiddleware");
const { adminAuth } = require("./middleware/adminAuth");
const editAuth = require("./middleware/editAuth");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

const app = express();

// Trust proxy - Required for Railway and other reverse proxies
// This allows Express to correctly identify client IPs from X-Forwarded-For header
app.set("trust proxy", 1);

// CORS - Allow frontend to access API
app.use(
  cors({
    origin: [
      "https://www.cooldoggo.com",
      "https://cooldoggo.com",
      "http://localhost:3000", // For local development
      "http://localhost:5173", // If using Vite locally
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

const PORT = process.env.PORT || 3000;

//Rate limit- Help protect from DDoS attacks
const postLimiter = rateLimit({
  windowMs: 60 * 15000,
  max: 1,
  message: {
    status: 429,
    message:
      "Too many submissions. Take your time to think about the next step of the story.",
  },
});

// Helmet setts various HTTP headers
app.use(helmet());

// MongoDB Connection
// Railway sets MONGO_URL automatically when you add MongoDB plugin
const mongoUri = process.env.MONGO_URL || process.env.MONGODB_URI;
mongoose
  .connect(mongoUri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB Error:", err));

// ==================== STORY MANAGEMENT ENDPOINTS ====================

// Create a new story (admin endpoint - protected with API key)
app.post("/story/create", adminAuth, async (req, res) => {
  try {
    const { title, description, accessCode, maxEntries, editCode } = req.body;

    if (!title || !accessCode) {
      return res
        .status(400)
        .json({ message: "Title and access code are required." });
    }

    const story = new Story({
      title,
      description,
      accessCode: accessCode.toUpperCase().trim(),
      maxEntries: maxEntries || null,
      editCode: editCode ? editCode.toUpperCase().trim() : null,
    });

    await story.save();
    res.status(201).json({
      message: "Story created successfully!",
      story: {
        id: story._id,
        title: story.title,
        accessCode: story.accessCode,
        editCode: story.editCode,
        status: story.status,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Access code already exists. Please choose a different one.",
      });
    }
    res
      .status(500)
      .json({ message: "Error creating story", error: err.message });
  }
});

// Get all stories (for admin/management)
app.get("/stories", async (req, res) => {
  try {
    const stories = await Story.find().select("-__v");
    res.json(stories);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching stories", error: err.message });
  }
});

// Update/Edit a story (admin endpoint - protected with API key)
app.put("/story/:accessCode/edit", adminAuth, async (req, res) => {
  try {
    const { accessCode } = req.params;
    const { title, description, status, maxEntries, editCode } = req.body;

    // Find story by access code
    const story = await Story.findOne({ accessCode: accessCode.toUpperCase() });

    if (!story) {
      return res.status(404).json({
        message: "Story not found with that access code."
      });
    }

    // Update only allowed fields (preserve _id, accessCode, createdAt)
    if (title !== undefined) story.title = title;
    if (description !== undefined) story.description = description;
    if (status !== undefined) {
      if (!['active', 'completed', 'archived'].includes(status)) {
        return res.status(400).json({
          message: "Invalid status. Must be 'active', 'completed', or 'archived'."
        });
      }
      story.status = status;

      // Set completedAt if changing to completed
      if (status === 'completed' && !story.completedAt) {
        story.completedAt = new Date();
      }
    }
    if (maxEntries !== undefined) story.maxEntries = maxEntries;
    if (editCode !== undefined) {
      story.editCode = editCode ? editCode.toUpperCase().trim() : null;
    }

    await story.save();

    res.json({
      message: "Story updated successfully!",
      story: {
        id: story._id,
        title: story.title,
        description: story.description,
        accessCode: story.accessCode,
        editCode: story.editCode,
        status: story.status,
        maxEntries: story.maxEntries,
        completedAt: story.completedAt,
        createdAt: story.createdAt,
      }
    });
  } catch (err) {
    res.status(500).json({
      message: "Error updating story",
      error: err.message
    });
  }
});

// Delete a story and all its entries (admin endpoint - protected with API key)
app.delete("/story/:accessCode/delete", adminAuth, async (req, res) => {
  try {
    const { accessCode } = req.params;

    // Find story by access code
    const story = await Story.findOne({ accessCode: accessCode.toUpperCase() });

    if (!story) {
      return res.status(404).json({
        message: "Story not found with that access code."
      });
    }

    // Delete all entries related to this story
    const deleteEntriesResult = await StoryEntry.deleteMany({ storyId: story._id });

    // Delete the story itself
    await Story.deleteOne({ _id: story._id });

    res.json({
      message: "Story and all related entries deleted successfully!",
      deleted: {
        story: {
          id: story._id,
          title: story.title,
          accessCode: story.accessCode
        },
        entriesDeleted: deleteEntriesResult.deletedCount
      }
    });
  } catch (err) {
    res.status(500).json({
      message: "Error deleting story",
      error: err.message
    });
  }
});

// Limited edit endpoint - allows users with edit code to update description and status only
app.put("/story/:accessCode/edit-limited", editAuth, async (req, res) => {
  try {
    const { description, status } = req.body;

    // The story is already loaded by editAuth middleware
    const story = req.story;

    // Update only description and status (NOT title, maxEntries, accessCode, or editCode)
    if (description !== undefined) {
      story.description = description;
    }

    if (status !== undefined) {
      if (!['active', 'completed', 'archived'].includes(status)) {
        return res.status(400).json({
          message: "Invalid status. Must be 'active', 'completed', or 'archived'."
        });
      }
      story.status = status;

      // Set completedAt if changing to completed
      if (status === 'completed' && !story.completedAt) {
        story.completedAt = new Date();
      }
    }

    // If no fields were provided
    if (description === undefined && status === undefined) {
      return res.status(400).json({
        message: "Please provide at least one field to update (description or status)."
      });
    }

    await story.save();

    res.json({
      message: "Story updated successfully!",
      story: {
        id: story._id,
        title: story.title,
        description: story.description,
        accessCode: story.accessCode,
        status: story.status,
        completedAt: story.completedAt,
        createdAt: story.createdAt,
      }
    });
  } catch (err) {
    res.status(500).json({
      message: "Error updating story",
      error: err.message
    });
  }
});

// ==================== STORY ENTRY ENDPOINTS ====================

// Get test
app.get("/story/test", async (req, res) => {
  res.send("Test successful.");
});

// GET all story entries for a specific story
app.get("/story/:accessCode/all", async (req, res) => {
  try {
    const { accessCode } = req.params;

    const story = await Story.findOne({ accessCode: accessCode.toUpperCase() });
    if (!story) {
      return res
        .status(404)
        .json({ message: "Story not found with that access code." });
    }

    const entries = await StoryEntry.find({ storyId: story._id })
      .sort({ createdAt: 1 })
      .select("-contactEmail"); // Don't expose emails publicly

    res.json({
      story: {
        title: story.title,
        description: story.description,
        status: story.status,
      },
      entries,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
});

// GET the latest story entry for a specific story
app.get("/story/:accessCode/latest", async (req, res) => {
  try {
    const { accessCode } = req.params;

    const story = await Story.findOne({ accessCode: accessCode.toUpperCase() });
    if (!story) {
      return res
        .status(404)
        .json({ message: "Story not found with that access code." });
    }

    const latest = await StoryEntry.findOne({ storyId: story._id })
      .sort({ createdAt: -1 })
      .select("-contactEmail");

    res.json({
      story: {
        title: story.title,
        description: story.description,
        status: story.status,
      },
      latestEntry: latest,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching latest entry", error: err.message });
  }
});

// POST Submit a new story entry (with access code validation)
app.post("/story/entry", postLimiter, validateAccessCode, async (req, res) => {
  try {
    const { text, previousEntryId, username, contactEmail } = req.body;
    const story = req.story; // Attached by validateAccessCode middleware

    // Validate required fields
    if (!username) {
      return res.status(400).json({
        message: "Username is required to contribute.",
      });
    }

    if (!text || text.length < 10) {
      return res.status(400).json({
        message: "Text must be at least 10 characters long.",
      });
    }

    // Check if story has reached max entries
    if (story.maxEntries) {
      const entryCount = await StoryEntry.countDocuments({
        storyId: story._id,
      });
      if (entryCount >= story.maxEntries) {
        return res.status(403).json({
          message: "This story has reached its maximum number of entries.",
        });
      }
    }

    // Check for race condition (someone else added an entry)
    const latest = await StoryEntry.findOne({ storyId: story._id }).sort({
      createdAt: -1,
    });

    // For first entry: previousEntryId should be null or "null" and latest should be null
    // For subsequent entries: previousEntryId should match latest._id
    const isFirstEntry =
      !latest && (!previousEntryId || previousEntryId === "null");
    const isValidSequentialEntry =
      latest && latest._id.toString() === previousEntryId;

    if (!isFirstEntry && !isValidSequentialEntry) {
      return res.status(409).json({
        message:
          "Someone already added the next part. Please reload the story.",
        latestId: latest ? latest._id : null,
      });
    }

    // Create new entry
    const newEntry = new StoryEntry({
      storyId: story._id,
      text,
      previousEntryId: previousEntryId || null,
      username,
      contactEmail,
    });

    await newEntry.save();

    res.status(201).json({
      message: "Your contribution has been added!",
      entry: {
        id: newEntry._id,
        text: newEntry.text,
        username: newEntry.username,
        createdAt: newEntry.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Error saving story entry",
      error: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
