// Claude Policy Generator Agent
// This agent takes form data and policy templates to generate custom policies using Claude

// Import required libraries (ensure these are installed in package.json)
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class ClaudePolicyAgent {
    constructor(apiKey = process.env.CLAUDE_API_KEY) {
        this.apiKey = apiKey;
        this.apiEndpoint = 'https://api.anthropic.com/v1/messages';
        this.model = 'claude-3-sonnet-20240229'; // Update with latest Claude model as needed
        this.policyTemplatesDir = path.join(__dirname, '..', 'policy-templates');
    }

    /**
     * Generate a policy using Claude based on form data and template
     * @param {Object} formData - Form data from the generator.html
     * @param {String} policyType - Type of policy to generate
     * @returns {Promise<String>} - Generated policy as markdown
     */
    async generatePolicy(formData, policyType) {
        try {
            // 1. Load policy template
            const templatePath = this.getTemplatePath(policyType);
            const template = await fs.readFile(templatePath, 'utf8');
            
            // 2. Format the prompt for Claude
            const prompt = this.formatPrompt(formData, template, policyType);
            
            // 3. Call Claude API
            const generatedPolicy = await this.callClaude(prompt);
            
            return generatedPolicy;
        } catch (error) {
            console.error(`Error generating policy: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get the path to a policy template file
     * @param {String} policyType - Type of policy to generate
     * @returns {String} - Path to the template file
     */
    getTemplatePath(policyType) {
        const templateMap = {
            'ethics': 'ai-ethics-policy.md',
            'risk': 'ai-risk-management-policy.md',
            'data': 'ai-data-governance-policy.md',
            'security': 'ai-security-policy.md',
            'model': 'ai-model-management-policy.md',
            'vendor': 'ai-procurement-vendor-management-policy.md',
            'usecase': 'ai-use-case-evaluation-policy.md',
            'master': 'ai-governance-master-policy.md'
        };
        
        const templateFile = templateMap[policyType] || 'ai-ethics-policy.md';
        return path.join(this.policyTemplatesDir, templateFile);
    }

    /**
     * Format the prompt for Claude based on form data and template
     * @param {Object} formData - Form data from the generator.html
     * @param {String} template - Policy template content
     * @param {String} policyType - Type of policy to generate
     * @returns {String} - Formatted prompt for Claude
     */
    formatPrompt(formData, template, policyType) {
        // Extract organization info from form data
        const orgName = formData.get('org-name') || 'Organization';
        const industry = formData.get('industry') || 'technology';
        const size = formData.get('size') || 'medium';
        const aiMaturity = formData.get('ai-maturity') || 'developing';
        const additionalRequirements = formData.get('additional-requirements') || '';
        
        // Create geographical scope
        const geoScope = [];
        if (formData.get('geo-na')) geoScope.push('North America');
        if (formData.get('geo-eu')) geoScope.push('Europe (EU)');
        if (formData.get('geo-global')) geoScope.push('Global');
        
        // Create ethical principles
        const ethicalPrinciples = [];
        if (formData.get('ethics-fairness')) ethicalPrinciples.push('fairness and non-discrimination');
        if (formData.get('ethics-transparency')) ethicalPrinciples.push('transparency and explainability');
        if (formData.get('ethics-privacy')) ethicalPrinciples.push('privacy and data protection');
        if (formData.get('ethics-safety')) ethicalPrinciples.push('safety and security');
        
        // Create risk categories
        const riskCategories = [];
        if (formData.get('risk-technical')) riskCategories.push('technical risks (performance, accuracy)');
        if (formData.get('risk-ethical')) riskCategories.push('ethical risks (bias, fairness)');
        if (formData.get('risk-legal')) riskCategories.push('legal/compliance risks');
        if (formData.get('risk-reputation')) riskCategories.push('reputational risks');
        
        // Get industry-specific regulations and guidance to incorporate
        const industryRegulations = this.getIndustrySpecificRegulations(industry, geoScope);
        
        // Build detailed instructions for Claude
        return `
You are an AI policy generation expert specializing in helping organizations create comprehensive, regulatory-compliant AI governance policies. Your task is to customize an AI ${this.getPolicyTypeName(policyType)} policy template for a specific organization based on their profile and needs.

# ORGANIZATION PROFILE
- Name: ${orgName}
- Industry: ${industry}
- Size: ${size}
- Geographic Operations: ${geoScope.join(', ') || 'Not specified'}
- AI Maturity Level: ${aiMaturity}
- Ethical Principles Emphasis: ${ethicalPrinciples.join(', ') || 'All standard principles'}
- Risk Categories Emphasis: ${riskCategories.join(', ') || 'All standard risk categories'}
- Additional Requirements: ${additionalRequirements}

# INDUSTRY-SPECIFIC REGULATIONS AND GUIDANCE
${industryRegulations}

# TEMPLATE TO CUSTOMIZE
\`\`\`markdown
${template}
\`\`\`

# CUSTOMIZATION INSTRUCTIONS
1. Tailor the policy to ${orgName}'s specific industry (${industry}), size (${size}), and geography (${geoScope.join(', ') || 'not specified'}).
2. Adapt the policy to the organization's AI maturity level (${aiMaturity}).
3. Emphasize the ethical principles and risk categories indicated in the profile.
4. Incorporate the relevant industry-specific regulations, compliance requirements, and best practices listed above.
5. Add industry-specific considerations, examples, controls, and implementation guidance.
6. Modify the roles and responsibilities to match what would be appropriate for ${orgName}'s size and structure.
7. Address any additional requirements specified.
8. Create realistic implementation guidelines that are practical for an organization of this profile.
9. Ensure the policy meets regulatory requirements for the specified geographic operations.
10. Keep the original structure of the policy (sections, numbering) but enhance the content.
11. Write in a clear, professional tone appropriate for a formal policy document.
12. Return ONLY the complete customized policy in markdown format without any explanation or additional text.

Generate a comprehensive, customized ${this.getPolicyTypeName(policyType)} policy for ${orgName} that they can immediately adopt and that addresses the specific regulatory requirements and AI governance challenges of their industry and regions of operation.
`;
    }

    /**
     * Get industry-specific regulations and guidance based on industry and geography
     * @param {String} industry - Industry sector
     * @param {Array} geoScope - Geographic regions of operation
     * @returns {String} - Industry-specific regulations and guidance text
     */
    getIndustrySpecificRegulations(industry, geoScope) {
        // Check if EU regulations apply
        const includesEU = geoScope.includes('Europe (EU)');
        const isGlobal = geoScope.includes('Global');
        const includesNA = geoScope.includes('North America');
        
        // Base regulations that apply to all
        let regulations = `## General AI Regulations and Standards
- NIST AI Risk Management Framework (AI RMF 1.0)
- ISO/IEC 42001 - Artificial Intelligence Management System Standard
- OECD AI Principles`;
        
        // Add EU-specific regulations if applicable
        if (includesEU || isGlobal) {
            regulations += `

## European Union AI Regulations
- AI Act (Comprehensive regulatory framework for AI systems with a risk-based approach)
- General Data Protection Regulation (GDPR) Article 22 on automated decision-making
- EU Ethics Guidelines for Trustworthy AI
- AI Liability Directive`;
        }
        
        // Add North America specific regulations
        if (includesNA || isGlobal) {
            regulations += `

## North America AI Regulations
- U.S. Blueprint for an AI Bill of Rights
- Canada's Directive on Automated Decision-Making
- U.S. Executive Order 14110 on Safe, Secure, and Trustworthy AI 
- State AI laws (e.g., Colorado AI Act, California SB 1047)`;
        }
        
        // Add industry-specific regulations
        switch (industry) {
            case 'healthcare':
                regulations += `

## Healthcare/Life Sciences AI Regulations
- FDA's Artificial Intelligence and Machine Learning in Software as a Medical Device
- Good Machine Learning Practice (GMLP) for Medical Device Development
- HIPAA compliance requirements for AI systems handling PHI
- EU's Medical Device Regulation (MDR) for AI-based medical devices
- International Medical Device Regulators Forum (IMDRF) guidance
- WHO guidance on Ethics and Governance of AI for Health
- Patient Safety AI Risk Controls and Monitoring Requirements
- Clinical Validation Standards for Healthcare AI`;
                break;
                
            case 'financial':
                regulations += `

## Financial Services AI Regulations
- EU's Digital Operational Resilience Act (DORA)
- UK PRA/FCA requirements for AI in financial services
- U.S. Banking Agency Guidance on Model Risk Management (SR 11-7)
- Basel Committee on Banking Supervision Principles for Operational Resilience
- FINRA AI supervision guidance
- Consumer Financial Protection Bureau (CFPB) guidance on AI/ML
- Fair lending laws and anti-discrimination requirements
- AML/KYC compliance for AI-based systems
- SEC guidance on AI in investment decision-making`;
                break;
                
            case 'retail':
                regulations += `

## Retail/E-commerce AI Regulations
- Consumer protection laws for AI-based pricing and recommendations
- Biometric information privacy laws for retail applications
- Algorithmic transparency requirements for automated decision-making
- Digital Services Act (EU) requirements for recommender systems
- FTC guidance on AI fairness and transparency in commerce
- Payment Systems Directive 2 (PSD2) for AI in payment processing
- Geographic restrictions on facial recognition in retail environments`;
                break;
                
            case 'manufacturing':
                regulations += `

## Manufacturing AI Regulations
- ISO/TS 5723 - Trustworthiness of artificial intelligence in manufacturing
- EU Machinery Directive requirements for AI-enabled equipment
- NIST standards for AI in smart manufacturing
- Worker safety regulations for collaborative AI systems
- Supply chain transparency requirements
- Product liability considerations for AI-enhanced products
- Environmental compliance for AI-optimized processes`;
                break;
                
            case 'technology':
                regulations += `

## Technology Industry AI Regulations
- AI product liability frameworks
- Interoperability and portability standards
- AI transparency and explainability requirements
- Privacy-by-design and privacy-by-default standards (ISO 31700)
- EU's Digital Services Act and Digital Markets Act
- Corporate Digital Responsibility frameworks
- FTC guidance on unfair and deceptive practices with AI
- IEEE Ethics Certification Program for Autonomous and Intelligent Systems`;
                break;
                
            case 'government':
                regulations += `

## Government/Public Sector AI Regulations
- Public sector algorithmic impact assessment requirements
- Algorithmic transparency acts for government AI use
- Civil rights protections in public sector AI deployment
- Procurement guidelines for government AI acquisition
- Standards for accessibility and equal access to AI-enabled services
- National security and classified information protections
- Public records and Freedom of Information Act considerations
- Administrative Procedure Act requirements for automated decisions
- Regulations on use of facial recognition by government agencies`;
                break;
                
            case 'education':
                regulations += `

## Education AI Regulations
- Family Educational Rights and Privacy Act (FERPA) compliance
- Student data protection regulations
- Accessibility requirements (ADA, Section 508)
- Educational equity and fairness standards
- UNESCO's Recommendation on the Ethics of AI in Education
- Special protections for minors' data in AI systems
- Transparency requirements for AI-based assessment systems
- EdTech privacy pledges and standards`;
                break;
                
            case 'transportation':
                regulations += `

## Transportation/Logistics AI Regulations
- Autonomous vehicle safety standards and regulations
- UNECE regulations on automated driving systems
- FAA guidelines for AI in aviation
- Maritime autonomous surface ship regulations
- Supply chain transparency requirements
- EU regulations on autonomous transport systems
- Safety certification standards for AI in critical transportation systems
- UN regulations on connected and automated vehicles`;
                break;
                
            case 'energy':
                regulations += `

## Energy/Utilities AI Regulations
- Critical infrastructure protection standards for AI systems
- Energy grid security regulations
- Environmental compliance optimization requirements
- Smart grid data privacy and security regulations
- AI reliability standards for essential services
- Safety regulations for AI in energy production
- Sustainable AI energy consumption guidelines`;
                break;
                
            case 'telecom':
                regulations += `

## Telecommunications AI Regulations
- Network management and neutrality regulations
- Critical infrastructure protection standards
- Customer data privacy regulations for AI analytics
- FCC AI/ML guidelines for network optimization
- Global telecommunications standards (ITU-T) for AI
- Requirements for AI in emergency services communications
- Digital Services Act compliance for content recommenders`;
                break;
                
            case 'media':
                regulations += `

## Media/Entertainment AI Regulations
- Content moderation regulations and standards
- EU Audiovisual Media Services Directive
- AI-generated content disclosure requirements
- Copyright considerations for AI-created works
- Digital Services Act content recommendation transparency
- Child protection measures for AI-driven content
- Political advertising and misinformation regulations`;
                break;
                
            case 'professional':
                regulations += `

## Professional Services AI Regulations
- Professional liability considerations for AI-assisted services
- Client confidentiality requirements
- AI ethics standards for professional advice
- Duty of care standards for AI-augmented professional services
- Legal services regulation for AI-assisted legal work
- Accounting standards for AI in financial reporting and auditing
- Regulatory guidelines for AI in tax preparation and advisory`;
                break;
                
            default:
                regulations += `

## Industry-Specific Considerations
- Identify the specific regulatory requirements that apply to your industry
- Review industry standards and best practices for AI governance
- Consider industry association guidelines for responsible AI use
- Evaluate competitive benchmarks for AI governance in your sector`;
                break;
        }
        
        return regulations;
    }

    /**
     * Get the full name of a policy type
     * @param {String} policyType - Short policy type (e.g., 'ethics')
     * @returns {String} - Full policy name
     */
    getPolicyTypeName(policyType) {
        const policyNames = {
            'ethics': 'Ethics',
            'risk': 'Risk Management',
            'data': 'Data Governance',
            'security': 'Security',
            'model': 'Model Management',
            'vendor': 'Procurement & Vendor Management',
            'usecase': 'Use Case Evaluation',
            'master': 'Governance Master'
        };
        
        return policyNames[policyType] || 'Ethics';
    }

    /**
     * Call Claude API to generate policy
     * @param {String} prompt - The formatted prompt for Claude
     * @returns {Promise<String>} - Generated policy
     */
    async callClaude(prompt) {
        try {
            const response = await axios.post(
                this.apiEndpoint,
                {
                    model: this.model,
                    max_tokens: 4000,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ]
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': this.apiKey,
                        'anthropic-version': '2023-06-01'
                    }
                }
            );
            
            return response.data.content[0].text;
        } catch (error) {
            console.error('Error calling Claude API:', error.response?.data || error.message);
            throw new Error(`Failed to generate policy with Claude: ${error.message}`);
        }
    }

    /**
     * Generate multiple policies based on form data
     * @param {Object} formData - Form data from the generator.html
     * @returns {Promise<Object>} - Object with policy types as keys and generated policies as values
     */
    async generatePolicies(formData) {
        const policyPromises = [];
        const policyResults = {};
        
        // Check which policies were selected and generate them
        if (formData.get('policy-ethics')) {
            policyPromises.push(this.generatePolicy(formData, 'ethics')
                .then(policy => { policyResults.ethics = policy; }));
        }
        
        if (formData.get('policy-risk')) {
            policyPromises.push(this.generatePolicy(formData, 'risk')
                .then(policy => { policyResults.risk = policy; }));
        }
        
        if (formData.get('policy-data')) {
            policyPromises.push(this.generatePolicy(formData, 'data')
                .then(policy => { policyResults.data = policy; }));
        }
        
        if (formData.get('policy-security')) {
            policyPromises.push(this.generatePolicy(formData, 'security')
                .then(policy => { policyResults.security = policy; }));
        }
        
        if (formData.get('policy-model')) {
            policyPromises.push(this.generatePolicy(formData, 'model')
                .then(policy => { policyResults.model = policy; }));
        }
        
        if (formData.get('policy-vendor')) {
            policyPromises.push(this.generatePolicy(formData, 'vendor')
                .then(policy => { policyResults.vendor = policy; }));
        }
        
        if (formData.get('policy-usecase')) {
            policyPromises.push(this.generatePolicy(formData, 'usecase')
                .then(policy => { policyResults.usecase = policy; }));
        }

        // Wait for all policies to be generated
        await Promise.all(policyPromises);
        
        return policyResults;
    }

    /**
     * Generate a sub-policy using Claude
     * @param {String} policyId - The ID of the sub-policy (e.g., ETH-PROC-001)
     * @param {String} policyName - The name of the sub-policy
     * @param {String} policyType - The type of sub-policy (e.g., Procedure, Standard)
     * @param {String} orgName - The organization name
     * @param {String} description - Description of the sub-policy
     * @param {Object} mainPolicies - Main policies for reference
     * @returns {Promise<String>} - Generated sub-policy as markdown
     */
    async generateSubPolicy(policyId, policyName, policyType, orgName, description, mainPolicies = {}) {
        try {
            // Find which main policy this sub-policy refers to
            const domain = policyId.split('-')[0]; // ETH, SEC, etc.
            let relatedMainPolicy = '';
            
            // Try to find a relevant main policy to use as context
            const domainToPolicy = {
                'ETH': mainPolicies.ethics,
                'RISK': mainPolicies.risk,
                'DATA': mainPolicies.data,
                'SEC': mainPolicies.security,
                'MDL': mainPolicies.model,
                'PROC': mainPolicies.vendor,
                'UC': mainPolicies.usecase,
                'HUM': mainPolicies.human,
                'INC': mainPolicies.incident,
                'GOV': mainPolicies.governance,
                'TRANS': mainPolicies.transparency
            };
            
            relatedMainPolicy = domainToPolicy[domain] || '';
            
            // Format the prompt for Claude
            const prompt = `
You are an AI policy generation expert specializing in helping organizations create comprehensive, regulatory-compliant AI governance policies and supporting documents. Your task is to create a supporting ${policyType} document identified as "${policyId}" (${policyName}) for ${orgName}.

# ORGANIZATION AND DOCUMENT DETAILS
- Organization Name: ${orgName}
- Document ID: ${policyId}
- Document Name: ${policyName}
- Document Type: ${policyType}
- Description: ${description}

# RELATED MAIN POLICY
${relatedMainPolicy ? '```markdown\n' + relatedMainPolicy + '\n```' : 'No direct main policy provided, create a standalone supporting document.'}

# INSTRUCTIONS
1. Create a comprehensive ${policyType.toLowerCase()} document titled "${policyName}" for ${orgName}.
2. The document should follow the format and style of a professional policy/procedure document.
3. Include the following elements:
   - Document title, ID (${policyId}), and effective date
   - Purpose and scope section
   - Definitions of key terms
   - Detailed content appropriate for a ${policyType.toLowerCase()}
   - References to related policies where appropriate
   - Version control information
4. Make the document specific to ${orgName} and relevant to their AI governance needs.
5. Format the document in clean, well-structured markdown.
6. The document should be comprehensive, detailed, and professionally written.
7. Return ONLY the complete document in markdown format without any explanation or additional text.

Create a detailed, professional, and implementation-ready ${policyType.toLowerCase()} that would be ready for adoption by ${orgName}.`;

            // Call Claude API with the prompt
            const subPolicyContent = await this.callClaude(prompt);
            
            return subPolicyContent;
        } catch (error) {
            console.error(`Error generating sub-policy: ${error.message}`);
            throw error;
        }
    }
}

// Export the agent class for use in other files
module.exports = ClaudePolicyAgent;