const OpenAI = require('openai');

class AIEmailGenerator {
  constructor(apiKey) {
    this.openai = new OpenAI({ apiKey });
  }

  async generatePersonalizedEmail(profile, service = 'lead generation services') {
    const prompt = this.createPrompt(profile, service);
    
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional email copywriter specializing in B2B outreach. Write concise, personalized cold emails that are professional yet engaging.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('AI generation error:', error);
      return this.getFallbackEmail(profile, service);
    }
  }

  createPrompt(profile, service) {
    return `Write a professional cold email to ${profile.name}, who works as ${profile.title} at ${profile.company}. 

The email should:
- Be personalized to their role and company
- Offer ${service}
- Be concise (under 150 words)
- Include a clear call-to-action
- Sound natural and conversational
- Have a compelling subject line

Format the response as:
Subject: [subject line]

[email body]

Profile details:
- Name: ${profile.name}
- Title: ${profile.title}
- Company: ${profile.company}
- Location: ${profile.location || 'Not specified'}`;
  }

  getFallbackEmail(profile, service) {
    return `Subject: Quick question about ${profile.company}'s growth

Hi ${profile.name.split(' ')[0]},

I noticed your role as ${profile.title} at ${profile.company} and wanted to reach out about something that might interest you.

We help companies like ${profile.company} improve their ${service} through AI-powered solutions. I'd love to share how we've helped similar businesses in your industry achieve measurable results.

Would you be open to a brief 15-minute conversation this week?

Best regards,
[Your Name]`;
  }

  async generateMultipleEmails(profiles, service) {
    const emails = [];
    
    for (const profile of profiles) {
      const email = await this.generatePersonalizedEmail(profile, service);
      emails.push({
        profile,
        email,
        timestamp: new Date().toISOString()
      });
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return emails;
  }
}

module.exports = AIEmailGenerator;