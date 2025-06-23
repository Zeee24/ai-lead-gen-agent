const axios = require('axios');
const cheerio = require('cheerio');

class LinkedInScraper {
  constructor() {
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
    };
  }

  async scrapeProfile(profileUrl) {
    try {
      const response = await axios.get(profileUrl, { headers: this.headers });
      const $ = cheerio.load(response.data);
      
      // Extract profile data
      const profile = {
        name: this.extractName($),
        title: this.extractTitle($),
        company: this.extractCompany($),
        location: this.extractLocation($),
        url: profileUrl
      };
      
      return profile;
    } catch (error) {
      console.error('Scraping error:', error.message);
      return null;
    }
  }

  extractName($) {
    return $('h1').first().text().trim() || 
           $('.pv-text-details__left-panel h1').text().trim() ||
           'Name not found';
  }

  extractTitle($) {
    return $('.text-body-medium').first().text().trim() ||
           $('.pv-text-details__left-panel .text-body-medium').text().trim() ||
           'Title not found';
  }

  extractCompany($) {
    return $('.pv-text-details__right-panel .text-body-small').first().text().trim() ||
           $('.text-body-small').first().text().trim() ||
           'Company not found';
  }

  extractLocation($) {
    return $('.pv-text-details__left-panel .text-body-small').last().text().trim() ||
           'Location not found';
  }
}

module.exports = LinkedInScraper;