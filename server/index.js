const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/build')));

// File upload configuration
const upload = multer({ dest: 'uploads/' });




// Initialize OpenAI (optional)
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

app.use(cors());
app.use(express.json());

// Email pattern generator
class EmailFinder {
  constructor() {
    this.commonPatterns = [
      '{first}.{last}@{domain}',
      '{first}{last}@{domain}',
      '{f}{last}@{domain}',
      '{first}@{domain}',
      '{first}.{l}@{domain}',
      '{first}_{last}@{domain}'
    ];
  }

  generateEmailPatterns(name, company) {
    const cleanName = this.cleanName(name);
    const domain = this.extractDomain(company);
    
    if (!cleanName.first || !cleanName.last || !domain) {
      return [];
    }

    return this.commonPatterns.map(pattern => {
      return pattern
        .replace('{first}', cleanName.first)
        .replace('{last}', cleanName.last)
        .replace('{f}', cleanName.first.charAt(0))
        .replace('{l}', cleanName.last.charAt(0))
        .replace('{domain}', domain);
    });
  }

  cleanName(fullName) {
    const parts = fullName.toLowerCase().split(' ').filter(part => part.length > 0);
    return {
      first: parts[0] || '',
      last: parts[parts.length - 1] || ''
    };
  }

  extractDomain(company) {
    const cleaned = company.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/inc|llc|ltd|corp|company|co/g, '');
    
    return cleaned ? `${cleaned}.com` : null;
  }
}

// AI Email Generator
function generateEmailSubject(contact) {
  const subjects = [
    `Quick question about ${contact.company || contact.Company}`,
    `Scaling opportunities for ${contact.company || contact.Company}`,
    `${contact.name || contact.Name}, thought you'd find this interesting`
  ];
  return subjects[Math.floor(Math.random() * subjects.length)];
}

function generateEmailBody(contact) {
  const name = contact.name || contact.Name || 'there';
  const company = contact.company || contact.Company || 'your company';
  
  return `Hi ${name},

I noticed ${company} is likely focused on growth and efficiency. I've been helping similar companies in your industry automate their lead generation process with AI.

Most sales teams spend 20+ hours weekly on manual prospecting. Our AI system processes 1000+ contacts into personalized campaigns in minutes.

Would you be interested in a quick 10-minute demo of how this could work for ${company}?

Best regards,
[Your Name]

P.S. Happy to send over a case study of how we helped a similar company increase their response rates by 340%.`;
}
// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


const emailFinder = new EmailFinder();

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Lead Gen Agent Server is running! 🚀' });
});

// LinkedIn scraper endpoint
app.post('/api/process-contacts', async (req, res) => {
  try {
    const { contacts } = req.body;

     // Simulate AI processing (replace with actual OpenAI API later)
    const processedContacts = contacts.map(contact => ({
      name: contact.name || contact.Name,
      email: contact.email || contact.Email,
      company: contact.company || contact.Company,
      title: contact.title || contact.Title || 'Professional',
      emailSubject: generateEmailSubject(contact),
      emailBody: generateEmailBody(contact)
    }));
    
    res.json({
      success: true,
      processedContacts,
      totalProcessed: processedContacts.length
    });
    
  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
});
    
// (Removed misplaced LinkedIn scraping code block that caused syntax error)



// Generate emails endpoint
app.post('/api/generate-emails', async (req, res) => {
  try {
    const { profile } = req.body;
    
    // Generate email patterns
    const emailPatterns = emailFinder.generateEmailPatterns(profile.name, profile.company);
    
    // Generate AI email
    const aiEmail = await generateAIEmail(profile);
    
    res.json({
      success: true,
      emailPatterns,
      aiEmail,
      profile
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Batch process endpoint
app.post('/api/batch-process', async (req, res) => {
  try {
    const { profileUrls } = req.body;
    const results = [];
    
    for (const url of profileUrls) {
      // Simulate scraping with demo data
      const profile = {
        name: `Demo User ${results.length + 1}`,
        title: ['CEO', 'CTO', 'Marketing Manager', 'Sales Director'][results.length % 4],
        company: `Company ${results.length + 1}`,
        url
      };
      
      const emailPatterns = emailFinder.generateEmailPatterns(profile.name, profile.company);
      const aiEmail = await generateAIEmail(profile);
      
      results.push({
        profile,
        emailPatterns,
        aiEmail
      });
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Lead Gen Agent Server running on port ${PORT}`);
  console.log(`🔗 Test at: http://localhost:${PORT}/api/test`);
  console.log(`📧 OpenAI: ${openai ? 'Connected' : 'Using fallback templates'}`);
});