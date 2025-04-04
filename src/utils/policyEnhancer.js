import { getScrapedData } from './supabaseClient'; // Only need getScrapedData if we want to re-fetch

// Analyze company data from scraped content
function analyzeScrapedContent(scrapedData) {
  if (!scrapedData) return null;

  const recommendations = {
    suggestedPolicies: [],
    riskLevel: 'low',
    companyProfile: {
      name: scrapedData.companyInfo?.name,
      industry: detectIndustry(scrapedData),
      size: estimateCompanySize(scrapedData),
      techStack: scrapedData.technologies
    },
    policyPriorities: []
  };

  // Analyze technologies used
  if (scrapedData.technologies?.ai) {
    recommendations.suggestedPolicies.push('AI Ethics Policy');
    recommendations.suggestedPolicies.push('AI Risk Management Policy');
    recommendations.riskLevel = 'high';
  }

  if (scrapedData.technologies?.cloud) {
    recommendations.suggestedPolicies.push('Cloud Security Policy');
    recommendations.suggestedPolicies.push('Data Governance Policy');
  }

  if (scrapedData.technologies?.security) {
    recommendations.suggestedPolicies.push('Security Policy');
    recommendations.policyPriorities.push('security');
  }

  // Analyze policy-relevant content
  for (const section of scrapedData.policyRelevantContent) {
    if (section.content.toLowerCase().includes('gdpr')) {
      recommendations.suggestedPolicies.push('GDPR Compliance Policy');
      recommendations.policyPriorities.push('privacy');
    }
    if (section.content.toLowerCase().includes('machine learning')) {
      recommendations.suggestedPolicies.push('ML Model Governance Policy');
    }
  }

  // Remove duplicates
  recommendations.suggestedPolicies = [...new Set(recommendations.suggestedPolicies)];
  recommendations.policyPriorities = [...new Set(recommendations.policyPriorities)];

  return recommendations;
}

// Helper function to detect industry based on content
function detectIndustry(scrapedData) {
  const content = scrapedData?.mainContent?.toLowerCase() || '';
  const industries = {
    'healthcare': ['healthcare', 'medical', 'hospital', 'patient'],
    'finance': ['banking', 'finance', 'investment', 'trading'],
    'technology': ['software', 'technology', 'tech', 'digital'],
    'retail': ['retail', 'shop', 'store', 'ecommerce'],
    'manufacturing': ['manufacturing', 'factory', 'production'],
    'education': ['education', 'school', 'university', 'learning']
  };

  for (const [industry, keywords] of Object.entries(industries)) {
    if (keywords.some(keyword => content.includes(keyword))) {
      return industry;
    }
  }

  return 'other';
}

// Helper function to estimate company size
function estimateCompanySize(scrapedData) {
  const content = scrapedData?.mainContent?.toLowerCase() || '';
  
  if (content.includes('fortune 500') || content.includes('enterprise')) {
    return 'enterprise';
  }
  if (content.includes('startup') || content.includes('small business')) {
    return 'small';
  }
  if (content.includes('medium') || content.includes('growing')) {
    return 'medium';
  }
  
  return 'unknown';
}

// Function to enhance policy generation with scraped data
export async function enhancePolicyGeneration(formData, url, scrapedContent) {
  try {
    // Analyze the provided scraped content directly
    const recommendations = analyzeScrapedContent(scrapedContent);
    
    if (!recommendations) {
      console.log('No recommendations generated from scraped content for:', url);
      return formData; // Return original form data if no recommendations
    }

    console.log('Generated Recommendations:', recommendations);

    // Enhance form data with recommendations
    const enhancedFormData = {
      ...formData,
      // Only update if the field isn't already filled
      industry: formData.industry || recommendations.companyProfile.industry,
      size: formData.size || recommendations.companyProfile.size,
      aiMaturity: formData.aiMaturity || (recommendations.companyProfile.techStack?.ai ? 'advanced' : 'beginner'),
      // Merge suggested policies (add new, don't overwrite existing selections)
      policies: {
        ...formData.policies,
        ...recommendations.suggestedPolicies.reduce((acc, policy) => {
          const policyKey = policy.toLowerCase().replace(/\s+/g, '-');
          // Only add if not already present in formData.policies
          if (!(formData.policies && formData.policies[policyKey])) {
              acc[policyKey] = true; 
          }
          return acc;
        }, {})
      },
      // Merge risks (add new, don't overwrite existing selections)
      risks: {
        ...formData.risks,
        technical: formData.risks?.technical || recommendations.riskLevel === 'high',
        compliance: formData.risks?.compliance || recommendations.policyPriorities.includes('compliance'),
        security: formData.risks?.security || recommendations.policyPriorities.includes('security')
      },
      // Add detected priorities if not already present
      additionalRequirements: [
        ...(formData.additionalRequirements || []),
        ...recommendations.policyPriorities.filter(p => !(formData.additionalRequirements || []).includes(p))
      ].filter((v, i, a) => a.indexOf(v) === i) // Ensure uniqueness
    };

    console.log('Enhanced Form Data:', enhancedFormData);
    return enhancedFormData;

  } catch (error) {
    console.error('Error enhancing policy generation:', error);
    return formData; // Return original form data on error
  }
} 