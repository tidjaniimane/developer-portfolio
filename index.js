const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"]
    },
  },
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, try again later.'
}));
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many contact form submissions, try again later.'
});
app.use(compression());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Portfolio data
const portfolioData = {
  personal: {
    name: "Your Name",
    title: "Full Stack Developer & 3D Enthusiast",
    email: "imanetidjani1174@gmail.com",
    phone: "0659660315",
    location: "Your City, Country",
    bio: "Passionate full-stack developer...",
    links: {
      github: "https://github.com/tidjaniimane",
      linkedin: "https://linkedin.com/in/yourprofile",
      twitter: "https://twitter.com/yourusername",
      website: "https://yourwebsite.com"
    }
  },
  skills: [
    { category: "Frontend", items: ["React", "Vue.js", "Three.js"] },
    { category: "Backend", items: ["Node.js", "Express"] }
  ],
  projects: [
    {
      id: 1,
      title: "E-Commerce Platform",
      description: "Full-stack e-commerce solution...",
      image: "/images/ecommerce-project.jpg",
      technologies: ["React", "Node.js", "MongoDB"],
      liveUrl: "https://your-ecommerce-demo.com",
      githubUrl: "https://github.com/yourusername/ecommerce-platform",
      featured: true,
      category: "Full Stack"
    }
  ],
  experience: [
    {
      company: "Tech Company Inc.",
      position: "Senior Developer",
      duration: "2022 - Present",
      description: "Lead development of applications..."
    }
  ]
};

// Routes
app.get('/api/portfolio', (req, res) => res.json(portfolioData));

app.get('/api/projects', (req, res) => {
  let { category, featured } = req.query;
  let filtered = portfolioData.projects;

  if (category) {
    filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (featured === 'true') {
    filtered = filtered.filter(p => p.featured);
  }

  res.json(filtered);
});

app.get('/api/projects/:id', (req, res) => {
  const project = portfolioData.projects.find(p => p.id === parseInt(req.params.id));
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

app.post('/api/contact', contactLimiter, async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, error: 'All fields are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'Invalid email format' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `Portfolio Contact: ${subject}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    };

    const autoReply = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Thank you for your message!',
      html: `
        <h3>Thanks for reaching out!</h3>
        <p>Hi ${name},</p>
        <p>I’ve received your message and will respond shortly.</p>
        <p>Best,<br>Your Name</p>
      `
    };

    await transporter.sendMail(mailOptions);
    await transporter.sendMail(autoReply);

    res.json({ success: true, message: 'Message sent successfully!' });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ success: false, error: 'Failed to send email. Try again later.' });
  }
});

app.post('/api/analytics', (req, res) => {
  const { event, data } = req.body;
  console.log('Analytics Event:', event, data);
  res.json({ success: true });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
