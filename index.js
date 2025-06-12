require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
const cors = require("cors");
// Enable CORS for all routes

app.use(cors()); // Enable CORS for all requests

app.get("/api/projects", (req, res) => {
    res.json({ message: "CORS is working!" });
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Sample portfolio data
const portfolioData = {
  personal: {
    name: "Your Name",
    title: "Full Stack Developer",
    bio: "I build amazing web applications",
    email: "your@email.com",
    links: {
      github: "https://github.com/yourusername",
      linkedin: "https://linkedin.com/in/yourprofile"
    }
  },
  projects: [
    {
      title: "My Project",
      description: "An amazing project",
      technologies: ["React", "Node.js"]
    }
  ],
  skills: [
    {
      category: "Frontend",
      items: ["JavaScript", "React"]
    }
  ]
};

// API Routes
app.get('/api/portfolio', (req, res) => {
  res.json(portfolioData);
});

app.post('/api/contact', (req, res) => {
  console.log('Contact form submitted:', req.body);
  res.json({ success: true });
});

// Handle all other routes by serving index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});