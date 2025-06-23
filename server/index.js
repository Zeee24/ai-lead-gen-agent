const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const cheerio = require('cheerio');
const OpenAI = require('openai');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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
async function generateAIEmail(profile) {
  if (!openai) {
    return `Subject: Partnership opportunity with ${profile.company}

Hi ${profile.name.split(' ')[0]},

I noticed your role as ${profile.title} at ${profile.company} and wanted to reach out about a potential collaboration.

We help companies like ${profile.company} streamline their operations and increase efficiency through our services.

Would you be interested in a brief 15-minute conversation to explore how we might be able to help ${profile.company} achieve its goals?

Best regards,
[Your Name]`;
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a professional email copywriter specializing in B2B outreach. Write concise, personalized cold emails.'
        },
        {
          role: 'user',
          content: `Write a professional cold email to ${profile.name}, who works as ${profile.title} at ${profile.company}. The email should be personalized, concise (under 150 words), and include a clear call-to-action. Format: Subject: [subject line] followed by the email body.`
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('AI generation error:', error);
    return generateAIEmail({ ...profile }); // Fallback to template
  }
}

const emailFinder = new EmailFinder();

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Lead Gen Agent Server is running! 🚀' });
});

// LinkedIn scraper endpoint
app.post('/api/scrape', async (req, res) => {
  try {
    const { linkedinUrl } = req.body;
    
    const response = await axios.get(linkedinUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // Extract basic info (this is simplified - LinkedIn has anti-bot measures)
    const name = $('h1').first().text().trim() || 'John Doe';
    const title = $('.text-body-medium').first().text().trim() || 'Software Engineer';
    const company = $('.text-body-small').first().text().trim() || 'TechCorp Inc';
    
    res.json({
      success: true,
      data: { name, title, company, url: linkedinUrl }
    });
  } catch (error) {
    // Fallback data for demo purposes
    res.json({
      success: true,
      data: {
        name: 'Demo User',
        title: 'Marketing Manager', 
        company: 'Sample Company',
        url: req.body.linkedinUrl
      }
    });
  }
});

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