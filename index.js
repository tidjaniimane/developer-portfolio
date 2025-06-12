const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middleware setup (before routes)
app.use(express.json()); // Built-in body parsing
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(compression());

// ✅ Security headers with nonce support for CSP
app.use(
    helmet({
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
            },
        },
    })
);

// ✅ Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { error: 'Too many requests from this IP, please try again later.' },
});
app.use(limiter);

const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100,
    message: { error: 'Too many contact form submissions, please try again later.' },
});

// ✅ Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Portfolio Data
const portfolioData = {
    personal: {
        name: "Your Name",
        title: "Full Stack Developer & 3D Enthusiast",
        email: "your.email@example.com",
        phone: "+1 (555) 123-4567",
        location: "Your City, Country",
        bio: "Passionate full-stack developer creating innovative web applications and 3D experiences.",
        links: {
            github: "https://github.com/yourusername",
            linkedin: "https://linkedin.com/in/yourprofile",
            twitter: "https://twitter.com/yourusername",
            website: "https://yourwebsite.com",
        },
    },
};

// ✅ API Routes
app.get('/api/portfolio', (req, res) => res.json(portfolioData));

// ✅ Contact Form Endpoint with Nodemailer
app.post('/api/contact', contactLimiter, async (req, res) => {
    console.log('BODY:', req.body); // 🔍 Debug: See what was sent from frontend

    try {
        const { name, email, subject, message } = req.body;

        // Validate input
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ success: false, error: 'All fields are required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, error: 'Invalid email format' });
        }

        // Setup Nodemailer transport
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Email to yourself
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
            `,
        };

        // Auto-reply to sender
        const autoReply = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Thank you for your message!',
            html: `
                <h3>Thanks for reaching out!</h3>
                <p>Hi ${name},</p>
                <p>I've received your message and will get back to you soon.</p>
                <p>Best regards,<br>Your Name</p>
            `,
        };

        // Send emails
        await transporter.sendMail(mailOptions);
        await transporter.sendMail(autoReply);

        res.json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ success: false, error: 'Failed to send message. Please try again later.' });
    }
});

app.post('/api/analytics', (req, res) => {
    const { event, data } = req.body;

    if (!event || !data) {
        return res.status(400).json({ success: false, error: 'Event type and data are required' });
    }

    console.log('Analytics event:', event, data);

    // Here, you can store analytics data in a database or send it to an external service
    // Example: Saving to a database (if using MongoDB)
    // await AnalyticsModel.create({ event, data });

    res.json({ success: true, message: 'Analytics event recorded' });
});


// ✅ Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// ✅ Serve the Main Application
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Something went wrong!' });
});

// ✅ Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Local: http://localhost:${PORT}`);
});

module.exports = app;
