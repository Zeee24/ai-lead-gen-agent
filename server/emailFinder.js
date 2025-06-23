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
    // Simple domain extraction - in production, you'd use a more sophisticated method
    const cleaned = company.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/inc|llc|ltd|corp|company|co/g, '');
    
    return cleaned ? `${cleaned}.com` : null;
  }

  scoreEmailConfidence(email, profile) {
    let score = 0.5; // Base score
    
    // Higher score for common patterns
    if (email.includes('.')) score += 0.2;
    if (email.split('@')[0].length > 3) score += 0.1;
    if (profile.company && email.includes(profile.company.toLowerCase().slice(0, 3))) score += 0.2;
    
    return Math.min(score, 1.0);
  }
}

module.exports = EmailFinder;