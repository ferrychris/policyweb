import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // Fetch the website content
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    // Load the HTML content
    const $ = cheerio.load(response.data);

    // Extract relevant content
    const content = {
      title: $('title').text(),
      description: $('meta[name="description"]').attr('content') || '',
      h1: $('h1').map((_, el) => $(el).text()).get().join(' '),
      mainContent: $('main, article, #main, .main, .content, .article')
        .map((_, el) => $(el).text())
        .get()
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim(),
      metaKeywords: $('meta[name="keywords"]').attr('content') || '',
      // Extract additional metadata
      ogTitle: $('meta[property="og:title"]').attr('content'),
      ogDescription: $('meta[property="og:description"]').attr('content'),
      ogType: $('meta[property="og:type"]').attr('content'),
      // Look for common tech stack indicators
      techIndicators: {
        react: $('script[src*="react"]').length > 0,
        angular: $('script[src*="angular"]').length > 0,
        vue: $('script[src*="vue"]').length > 0,
        ai: $('body').text().toLowerCase().includes('artificial intelligence') || 
            $('body').text().toLowerCase().includes('machine learning'),
        cloud: $('body').text().toLowerCase().includes('cloud') || 
               $('script[src*="aws"]').length > 0 || 
               $('script[src*="azure"]').length > 0
      }
    };

    // Clean and format the content
    const formattedContent = `
      Title: ${content.title}
      Description: ${content.description}
      Main Headings: ${content.h1}
      Keywords: ${content.metaKeywords}
      Main Content Summary: ${content.mainContent.substring(0, 1000)}
      Tech Stack Indicators: ${Object.entries(content.techIndicators)
        .filter(([_, value]) => value)
        .map(([key]) => key)
        .join(', ')}
    `;

    return res.status(200).json({ content: formattedContent });
  } catch (error) {
    console.error('Error scraping website:', error);
    return res.status(500).json({ error: 'Failed to scrape website' });
  }
} 