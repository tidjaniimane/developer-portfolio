const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Sample portfolio data (replace with your actual data or connect to a database)
const portfolioData = {
  personal: {
    name: "Your Name",
    title: "Full Stack Developer & 3D Enthusiast",
    bio: "Passionate about creating innovative web applications and immersive 3D experiences. Let's bring your ideas to life through code.",
    email: "your.email@example.com",
    links: {
      github: "https://github.com/yourusername",
      linkedin: "https://linkedin.com/in/yourprofile",
      twitter: "https://twitter.com/yourhandle",
      website: "https://yourwebsite.com"
    }
  },
  projects: [
    {
      id: 1,
      title: "Interactive 3D Portfolio",
      description: "A modern portfolio website featuring Three.js animations and interactive 3D elements.",
      category: "3D/Creative",
      technologies: ["Three.js", "JavaScript", "HTML5", "CSS3"],
      liveUrl: "https://yourportfolio.com",
      githubUrl: "https://github.com/yourusername/3d-portfolio"
    },
    {
      id: 2,
      title: "E-commerce Platform",
      description: "Full-featured e-commerce platform with product management, cart functionality, and payment processing.",
      category: "Full Stack",
      technologies: ["React", "Node.js", "MongoDB", "Stripe API"],
      liveUrl: "https://store.example.com",
      githubUrl: "https://github.com/yourusername/ecommerce-platform"
    },
    {
      id: 3,
      title: "AI Image Generator",
      description: "Web application that generates images using machine learning models with user-provided prompts.",
      category: "AI/ML",
      technologies: ["Python", "TensorFlow", "React", "Flask"],
      liveUrl: "https://ai-images.example.com",
      githubUrl: "https://github.com/yourusername/ai-image-generator"
    }
  ],
  skills: [
    {
      category: "Frontend",
      items: ["React", "Vue.js", "JavaScript", "TypeScript", "HTML5", "CSS3", "SASS"]
    },
    {
      category: "Backend",
      items: ["Node.js", "Express", "Python", "Django", "Flask", "REST APIs"]
    },
    {
      category: "Database",
      items: ["MongoDB", "PostgreSQL", "MySQL", "Firebase"]
    },
    {
      category: "Cloud & DevOps",
      items: ["AWS", "Docker", "Kubernetes", "CI/CD", "GitHub Actions"]
    },
    {
      category: "Mobile",
      items: ["React Native", "Flutter", "iOS Development"]
    },
    {
      category: "3D & Design",
      items: ["Three.js", "Blender", "WebGL", "Figma", "Adobe Creative Suite"]
    }
  ]
};

// API Routes
app.get('/api/portfolio', (req, res) => {
  res.json(portfolioData);
});

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate input
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }

    // In a real application, you would send an email here
    // For demonstration, we'll just log it and return success
    console.log('New contact form submission:');
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);

    // Example email sending with nodemailer (uncomment and configure)
    /*
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: email,
      to: process.env.EMAIL_USER,
      subject: `New Contact Form Submission: ${subject}`,
      text: `You have a new message from ${name} (${email}):\n\n${message}`
    };

    await transporter.sendMail(mailOptions);
    */

    res.json({ success: true });
  } catch (error) {
    console.error('Error processing contact form:', error);
    res.status(500).json({ success: false, error: "Failed to send message" });
  }
});

app.post('/api/analytics', (req, res) => {
  // In a real application, you would log analytics events to a database
  console.log('Analytics event:', req.body.event, req.body.data);
  res.json({ success: true });
});

// Serve index.html for all other routes (client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});