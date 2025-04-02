import OpenAI from 'openai';
import { getUserPackage } from './database';

// Configuration
const OPENAI_CONFIG = {
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
  maxRetries: 3,
  defaultModel: 'gpt-4',
  maxTokens: {
    basic: 4000,
    professional: 6000,
    premium: 8000,
  },
  temperature: {
    basic: 0.7,
    professional: 0.7,
    premium: 0.8,
  },
};

// Validate environment variables
const validateEnvironment = () => {
  const apiKey = OPENAI_CONFIG.apiKey;
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured. Please set the VITE_OPENAI_API_KEY environment variable.');
  }
  if (apiKey.startsWith('your_') || apiKey.length < 20) {
    throw new Error('Invalid OpenAI API key format. Please check your VITE_OPENAI_API_KEY environment variable.');
  }
  console.log('OpenAI configuration loaded successfully');
};

// Run environment validation
validateEnvironment();

// Initialize OpenAI client
const openai = new OpenAI(OPENAI_CONFIG);

/**
 * Validates the input parameters for policy generation
 */
const validateInputs = (templateName, customizations, packageType) => {
  if (!templateName || typeof templateName !== 'string') {
    throw new Error('Invalid template name provided');
  }
  if (!customizations || typeof customizations !== 'object') {
    throw new Error('Invalid customizations provided');
  }
  if (!['basic', 'professional', 'premium'].includes(packageType)) {
    throw new Error('Invalid package type provided');
  }

  // Validate required customization fields
  const requiredFields = ['companyName', 'website', 'email', 'country', 'industry', 'aiMaturityLevel'];
  const missingFields = requiredFields.filter(field => !customizations[field]);
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
};

/**
 * Creates the system prompt for policy generation
 */
const createSystemPrompt = () => ({
  role: 'system',
  content: `You are an expert in creating professional business policies with expertise in AI governance, ethics, and compliance. 
  Your task is to generate well-structured, comprehensive policies that are:
  1. Clear and concise
  2. Professional in tone
  3. Compliant with industry standards
  4. Easy to understand and implement
  5. Tailored to the organization's AI maturity level
  6. Appropriate for the organization's size and industry
  
  Format your policies with:
  - Numbered sections and subsections (e.g., 1, 1.1, 1.2, 2, etc.)
  - Clear headings and paragraphs
  - No asterisks or bullet points
  - Consistent formatting throughout
  - Professional markdown formatting
  
  Important: Do not include any sensitive information or personal data in the generated content.`,
});

/**
 * Creates the user prompt for policy generation
 */
const createUserPrompt = (templateName, customizations) => {
  const {
    companyName,
    website,
    email,
    country,
    industry,
    aiMaturityLevel,
    effectiveDate,
    templateType,
  } = customizations;

  return {
    role: 'user',
    content: `Generate a detailed ${templateName} policy for ${companyName} with the following specifications:

Organization Details:
- Company Name: ${companyName}
- Website: ${website}
- Email: ${email}
- Country: ${country}
- Industry: ${industry}
- AI Maturity Level: ${aiMaturityLevel}
- Effective Date: ${effectiveDate}
- Template Type: ${templateType}

Please ensure that:
1. The policy is tailored to the specified AI Maturity Level (${aiMaturityLevel})
2. The content is appropriate for a ${industry} company
3. All sections are properly numbered and formatted
4. The language is clear and professional
5. The policy includes all necessary legal and compliance elements
6. No sensitive or personal information is included
7. The policy follows standard industry practices
8. The content is structured for ${templateType} template type
9. The policy is comprehensive yet concise
10. The formatting is consistent with markdown standards`,
  };
};

/**
 * Handles rate limiting and retries for OpenAI API calls with exponential backoff
 */
const withRetry = async (fn, retries = OPENAI_CONFIG.maxRetries, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && (error.status === 429 || error.status === 500)) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

/**
 * Sanitizes the generated content to ensure it's safe and properly formatted
 */
const sanitizeContent = content => content
  .replace(/[<>]/g, '') // Remove potentially dangerous characters
  .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines
  .trim();

/**
 * Generates a policy based on the provided parameters
 * @param {string} templateName - The type of policy to generate
 * @param {object} customizations - The customization options
 * @param {string} packageType - The user's package type (basic, professional, premium)
 * @param {Function} onProgress - Optional callback for progress updates
 * @returns {Promise<string>} The generated policy content
 */
export const generatePolicy = async (templateName, customizations, packageType = 'basic', onProgress) => {
  try {
    // Validate inputs
    validateInputs(templateName, customizations, packageType);
    
    // Update progress if callback provided
    if (onProgress) onProgress(20);

    // Get user's package details
    const userPackage = getUserPackage('user-1');
    const currentPackage = userPackage?.key || packageType;

    // Get configuration based on package type
    const maxTokens = OPENAI_CONFIG.maxTokens[currentPackage] || OPENAI_CONFIG.maxTokens.basic;
    const temperature = OPENAI_CONFIG.temperature[currentPackage] || OPENAI_CONFIG.temperature.basic;
    
    // Update progress if callback provided
    if (onProgress) onProgress(40);

    // Generate the policy with retry mechanism
    const response = await withRetry(async () => openai.chat.completions.create({
      model: OPENAI_CONFIG.defaultModel,
      messages: [
        createSystemPrompt(),
        createUserPrompt(templateName, customizations)
      ],
      temperature,
      max_tokens: maxTokens
    }));
    
    // Update progress if callback provided
    if (onProgress) onProgress(80);

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('No content generated in the response');
    }

    // Sanitize and return the generated content
    const content = sanitizeContent(response.choices[0].message.content);
    
    // Update progress if callback provided
    if (onProgress) onProgress(100);
    
    return content;
  } catch (error) {
    console.error('Error generating policy:', error);
    
    // Provide more specific error messages
    if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a few moments.');
    } else if (error.status === 401) {
      throw new Error('Authentication failed. Please check your API key.');
    } else if (error.status === 400) {
      throw new Error('Invalid request. Please check your input parameters.');
    } else if (error.message.includes('Missing required fields')) {
      throw error; // Pass through validation errors
    }
    
    throw new Error('Failed to generate policy. Please try again later.');
  }
};

export default openai;
