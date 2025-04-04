import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to invoke the Supabase Edge Function for scraping via direct URL
export async function invokeScrapeFunction(url) {
  const functionUrl = 'https://vgedgxfxhiiilzqydfxu.supabase.co/functions/v1/scrape-website'; // User-provided URL

  try {
    const response = await axios.post(
      functionUrl,
      { url }, // Request body
      {
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 45000, // Increased timeout for potentially longer scraping (45 seconds)
      }
    );

    // Check for successful response status
    if (response.status !== 200) {
      console.error('Scraping function HTTP error:', response.status, response.statusText, response.data);
      throw new Error(`Scraping service returned status ${response.status}`);
    }

    // Check if the function itself returned an error in the JSON body
    if (response.data.error) {
      console.error('Scraping function returned error:', response.data.error, response.data.details);
      throw new Error(response.data.error);
    }

    if (!response.data.content) {
      console.error('Scraping function response missing content:', response.data);
      throw new Error('Scraping function returned invalid data');
    }

    return response.data.content; // Return the scraped content directly

  } catch (err) {
    console.error('Error calling scrape function URL:', err);
    
    let errorMessage = 'An unexpected error occurred during scraping';
    if (axios.isAxiosError(err)) {
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = err.response.data?.error || `Scraping service error: ${err.response.status}`;
        console.error('Axios response error:', err.response.data);
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = 'No response received from scraping service. It might be offline or timing out.';
        console.error('Axios request error:', err.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = err.message;
      }
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }
    
    throw new Error(errorMessage);
  }
}

// Function to save scraped data to the database
export async function saveScrapedData(title, url, content) {
  try {
    const { data, error } = await supabase
      .from('scraped_data')
      .insert([{ 
        title, 
        url, 
        content: JSON.stringify(content)
      }])
      .select();

    if (error) {
      console.error('Supabase DB save error:', error);
      throw error;
    }

    return data[0]; // Return the saved DB record
  } catch (err) {
    console.error('Error saving scraped data to DB:', err);
    throw err;
  }
}

// Function to get scraped data from the database (for caching)
export async function getScrapedData(url) {
  try {
    const { data, error } = await supabase
      .from('scraped_data')
      .select('*')
      .eq('url', url)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;
    if (data && data.length > 0) {
      // Check if content is a string and needs parsing
      const content = typeof data[0].content === 'string' 
                      ? JSON.parse(data[0].content) 
                      : data[0].content;
      return {
        ...data[0],
        content: content
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching scraped data from DB:', error);
    throw error;
  }
}

// Optional: Function to get all scraped data
export async function getAllScrapedData() {
  try {
    const { data, error } = await supabase
      .from('scraped_data')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching all scraped data:', error);
    throw error;
  }
} 