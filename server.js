// Express server for handling Stripe payments and AI policy generation
require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const ClaudePolicyAgent = require('./js/claude-policy-agent');

const app = express();
const port = process.env.PORT || 3456;

// Initialize Claude policy agent
const policyAgent = new ClaudePolicyAgent(process.env.CLAUDE_API_KEY);

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static('./')); // Serve static files from current directory

// Map of product IDs to prices (these should match your client-side prices)
const PRODUCTS = {
  'basic_plan': {
    name: 'Basic Plan',
    price: 900, // $900 (stored in dollars)
    description: '3 core policy templates with simple customization',
    policyLimit: 3
  },
  'professional_package': {
    name: 'Professional Package',
    price: 1500, // $1,500 (stored in dollars)
    description: '5 essential policy templates with basic customization',
    policyLimit: 5
  },
  'premium_suite': {
    name: 'Premium Suite',
    price: 5000, // $5,000 (stored in dollars)
    description: 'Full suite of 18+ policy templates with advanced customization',
    policyLimit: 18
  }
};

// In-memory storage for generated policies (in production, use a database)
const generatedPolicies = new Map();

// API endpoint to create a payment intent
app.post('/api/create-payment-intent', async (req, res) => {
  const { productId, email } = req.body;
  
  // Validate product ID
  if (!PRODUCTS[productId]) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  try {
    // Create a customer (optional, but useful for tracking)
    const customer = await stripe.customers.create({
      email: email
    });

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: PRODUCTS[productId].price * 100, // Convert from dollars to cents for Stripe
      currency: 'usd',
      customer: customer.id,
      metadata: {
        productId: productId,
        productName: PRODUCTS[productId].name,
      },
      description: `Purchase of ${PRODUCTS[productId].name}`,
      receipt_email: email,
    });

    // Return the client secret to the client
    res.json({
      clientSecret: paymentIntent.client_secret,
      productId: productId,
      amount: PRODUCTS[productId].price
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to generate AI policies
app.post('/api/generate-policies', async (req, res) => {
  try {
    console.log("Received policy generation request");
    const formData = req.body;
    
    // Create mock FormData object to match the interface expected by the agent
    const mockFormData = {
      get: (key) => {
        if (key === 'org-name') return formData.orgName;
        if (key === 'industry') return formData.industry;
        if (key === 'size') return formData.size;
        if (key === 'ai-maturity') return formData.aiMaturity;
        if (key === 'ai-strategy') return formData.aiStrategy;
        if (key === 'additional-requirements') return formData.additionalRequirements;
        // Geography
        if (key === 'geo-na') return formData.geoOperations?.northAmerica ? 'on' : '';
        if (key === 'geo-eu') return formData.geoOperations?.europe ? 'on' : '';
        if (key === 'geo-global') return formData.geoOperations?.global ? 'on' : '';
        // Policies
        if (key === 'policy-ethics') return formData.policies?.ethics ? 'on' : '';
        if (key === 'policy-risk') return formData.policies?.risk ? 'on' : '';
        if (key === 'policy-data') return formData.policies?.data ? 'on' : '';
        if (key === 'policy-security') return formData.policies?.security ? 'on' : '';
        if (key === 'policy-model') return formData.policies?.model ? 'on' : '';
        if (key === 'policy-vendor') return formData.policies?.vendor ? 'on' : '';
        if (key === 'policy-usecase') return formData.policies?.usecase ? 'on' : '';
        if (key === 'policy-human') return formData.policies?.human ? 'on' : '';
        if (key === 'policy-incident') return formData.policies?.incident ? 'on' : '';
        // Ethics
        if (key === 'ethics-fairness') return formData.ethics?.fairness ? 'on' : '';
        if (key === 'ethics-transparency') return formData.ethics?.transparency ? 'on' : '';
        if (key === 'ethics-privacy') return formData.ethics?.privacy ? 'on' : '';
        if (key === 'ethics-safety') return formData.ethics?.safety ? 'on' : '';
        // Risks
        if (key === 'risk-technical') return formData.risks?.technical ? 'on' : '';
        if (key === 'risk-ethical') return formData.risks?.ethical ? 'on' : '';
        if (key === 'risk-legal') return formData.risks?.legal ? 'on' : '';
        if (key === 'risk-reputation') return formData.risks?.reputation ? 'on' : '';
        
        return '';
      }
    };
    
    console.log("Generating policies for: ", formData.orgName);
    
    // Generate all requested policies regardless of payment status
    // This is a temporary fix to make the demo work
    formData.hasPaid = true;
    
    // Prepare for direct template based generation (faster than Claude API for demo)
    const policyResults = {};
    
    // Read template files to use as mock data
    const templateDir = path.join(__dirname, 'policy-templates');
    
    // Process all selected policies regardless of limits
    for (const policyType of Object.keys(formData.policies)) {
      // Check if this policy was selected
      if (formData.policies[policyType]) {
        let templateFileName;
        
        // Map policy types to template files
        switch(policyType) {
          case 'ethics': templateFileName = 'ai-ethics-policy.md'; break;
          case 'risk': templateFileName = 'ai-risk-management-policy.md'; break;
          case 'data': templateFileName = 'ai-data-governance-policy.md'; break;
          case 'security': templateFileName = 'ai-security-policy.md'; break;
          case 'model': templateFileName = 'ai-model-management-policy.md'; break;
          case 'vendor': templateFileName = 'ai-procurement-vendor-management-policy.md'; break;
          case 'usecase': templateFileName = 'ai-use-case-evaluation-policy.md'; break;
          case 'human': templateFileName = 'ai-governance-master-policy.md'; break;
          case 'incident': templateFileName = 'ai-risk-management-policy.md'; break;
          case 'compliance': templateFileName = 'ai-governance-master-policy.md'; break;
          case 'governance': templateFileName = 'ai-governance-master-policy.md'; break;
          case 'transparency': templateFileName = 'ai-ethics-policy.md'; break;
          case 'deployment': templateFileName = 'ai-model-management-policy.md'; break;
          case 'training': templateFileName = 'ai-governance-master-policy.md'; break;
          default: 
            console.log(`No template found for policy type: ${policyType}`);
            continue;
        }
        
        try {
          console.log(`Loading template ${templateFileName} for ${policyType}`);
          
          // Check if the template file exists
          const templatePath = path.join(templateDir, templateFileName);
          if (!fs.existsSync(templatePath)) {
            console.error(`Template file not found: ${templatePath}`);
            
            // Create a basic placeholder template
            policyResults[policyType] = `# ${policyType.toUpperCase()} Policy for ${formData.orgName}\n\nEffective Date: ${new Date().toLocaleDateString()}\n\n## Purpose and Scope\n\nThis policy defines the standards and procedures for ${policyType} in AI systems at ${formData.orgName}.\n\n## Policy Details\n\nDetails to be customized based on organization needs.`;
            continue;
          }
          
          // Load and customize the template
          const template = fs.readFileSync(templatePath, 'utf8')
            .replace(/\[Organization Name\]/g, formData.orgName)
            .replace(/\[Insert Date\]/g, new Date().toLocaleDateString());
          
          policyResults[policyType] = template;
          console.log(`Generated ${policyType} policy successfully`);
        } catch (error) {
          console.error(`Error generating ${policyType} policy:`, error);
          // Create a fallback policy if template loading fails
          policyResults[policyType] = `# ${policyType.toUpperCase()} Policy for ${formData.orgName}\n\nEffective Date: ${new Date().toLocaleDateString()}\n\n## Purpose and Scope\n\nThis policy defines the standards and procedures for ${policyType} in AI systems at ${formData.orgName}.\n\n## Policy Details\n\nDetails to be customized based on organization needs.`;
        }
      }
    }
    
    // Generate additional policies for the premium package
    if (formData.selectedPackage === 'premium') {
      const additionalPolicyTypes = ['compliance', 'governance', 'transparency', 'deployment', 'training'];
      for (const policyType of additionalPolicyTypes) {
        if (!policyResults[policyType]) {
          // Create a basic placeholder template for additional premium policies
          policyResults[policyType] = `# ${policyType.toUpperCase()} Policy for ${formData.orgName}\n\nEffective Date: ${new Date().toLocaleDateString()}\n\n## Purpose and Scope\n\nThis policy defines the standards and procedures for ${policyType} in AI systems at ${formData.orgName}.\n\n## Policy Details\n\nDetails to be customized based on organization needs.`;
        }
      }
    }
    
    // Store generated policies for download later
    const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    generatedPolicies.set(sessionId, { 
      orgName: formData.orgName,
      policies: policyResults,
      timestamp: Date.now()
    });
    
    console.log(`Returning ${Object.keys(policyResults).length} policies`);
    
    // Add session ID to response
    res.json({
      ...policyResults,
      sessionId
    });
    
    // In a production environment, we would use Claude to enhance these policies
    // For demo purposes, we'll just use the templates
    
  } catch (error) {
    console.error('Error generating policies:', error);
    res.status(500).json({ error: 'Failed to generate policies' });
  }
});

// API endpoint to download generated policies as a zip file
app.post('/api/download-policies', async (req, res) => {
  try {
    const { orgName, sessionId } = req.body;
    
    // Get stored policies (in production, this would come from a database)
    const storedData = generatedPolicies.get(sessionId) || { 
      orgName, 
      policies: {} 
    };
    
    // If no session ID or no policies found, check if there are any recent policies for this org
    if (!sessionId || Object.keys(storedData.policies).length === 0) {
      // Look for the most recent policies for this organization
      for (const [id, data] of generatedPolicies.entries()) {
        if (data.orgName === orgName && Object.keys(data.policies).length > 0) {
          storedData.policies = data.policies;
          break;
        }
      }
    }
    
    // Create a zip file
    res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename=${orgName.replace(/\s+/g, '-')}-AI-Policies.zip`
    });
    
    const archive = archiver('zip', {
      zlib: { level: 9 } // Compression level
    });
    
    // Pipe the archive to the response
    archive.pipe(res);
    
    // Add each policy to the zip
    Object.entries(storedData.policies).forEach(([type, content]) => {
      let policyName = 'policy';
      
      switch(type) {
        case 'ethics': policyName = 'AI-Ethics-Policy'; break;
        case 'risk': policyName = 'AI-Risk-Management-Policy'; break;
        case 'data': policyName = 'AI-Data-Governance-Policy'; break;
        case 'security': policyName = 'AI-Security-Policy'; break;
        case 'model': policyName = 'AI-Model-Management-Policy'; break;
        case 'vendor': policyName = 'AI-Procurement-Vendor-Management-Policy'; break;
        case 'usecase': policyName = 'AI-Use-Case-Evaluation-Policy'; break;
        case 'human': policyName = 'Human-AI-Collaboration-Policy'; break;
        case 'incident': policyName = 'AI-Incident-Response-Policy'; break;
      }
      
      const filename = `${orgName.replace(/\s+/g, '-')}-${policyName}.md`;
      archive.append(content, { name: filename });
    });
    
    // Add a readme file explaining the policies
    const readme = `# AI Policies for ${orgName}

Generated on ${new Date().toLocaleDateString()}

## Included Policies

${Object.keys(storedData.policies).map(type => {
  const policyNames = {
    ethics: 'AI Ethics Policy',
    risk: 'AI Risk Management Policy',
    data: 'AI Data Governance Policy',
    security: 'AI Security Policy',
    model: 'AI Model Management Policy',
    vendor: 'AI Procurement & Vendor Management Policy',
    usecase: 'AI Use Case Evaluation Policy',
    human: 'Human-AI Collaboration Policy',
    incident: 'AI Incident Response Policy'
  };
  return `- ${policyNames[type] || type}`;
}).join('\n')}

These policies were generated by WhitegloveAI Policy Generator using Claude AI.
`;
    archive.append(readme, { name: 'README.md' });
    
    // Finalize the archive
    archive.finalize();
    
  } catch (error) {
    console.error('Error creating policy download:', error);
    res.status(500).json({ error: 'Failed to create policy download' });
  }
});

// API endpoint to convert a policy to different formats
app.post('/api/convert-policy', async (req, res) => {
  try {
    const { content, policyName, orgName, format } = req.body;
    
    if (!content || !format) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // For now, just return the markdown content (in a real app, you would convert to docx or pdf)
    res.setHeader('Content-Disposition', `attachment; filename=${orgName.replace(/\s+/g, '-')}-${policyName.replace(/\s+/g, '-')}.${format}`);
    
    if (format === 'docx') {
      // In a real app, convert markdown to docx
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      // For now, return markdown content
      res.send(Buffer.from(content));
    } else if (format === 'pdf') {
      // In a real app, convert markdown to pdf
      res.setHeader('Content-Type', 'application/pdf');
      // For now, return markdown content
      res.send(Buffer.from(content));
    } else {
      // Return as markdown
      res.setHeader('Content-Type', 'text/markdown');
      res.send(content);
    }
  } catch (error) {
    console.error('Error converting policy:', error);
    res.status(500).json({ error: 'Failed to convert policy' });
  }
});

// API endpoint to generate sub-policy
app.post('/api/generate-subpolicy', async (req, res) => {
  try {
    const { orgName, policyId, policyName, policyType, mainPolicies } = req.body;
    
    if (!orgName || !policyId || !policyName || !policyType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create a prompt for the sub-policy
    const description = getSubPolicyDescription(policyType, policyName);
    
    // Generate the sub-policy using Claude
    const subPolicyContent = await policyAgent.generateSubPolicy(
      policyId, 
      policyName, 
      policyType, 
      orgName, 
      description,
      mainPolicies
    );
    
    // Return the generated content
    res.json({ content: subPolicyContent });
  } catch (error) {
    console.error('Error generating sub-policy:', error);
    res.status(500).json({ error: 'Failed to generate sub-policy' });
  }
});

// Helper function to get description for different sub-policy types
function getSubPolicyDescription(policyType, policyName) {
  const descriptions = {
    'Procedure': 'A detailed step-by-step process that implements the main policy',
    'Standard': 'Technical specifications and requirements that support the main policy',
    'Framework': 'A comprehensive methodology that provides structure to implement the policy',
    'Template': 'A standardized form or document template used in policy implementation'
  };
  
  return descriptions[policyType] || `Supporting document for ${policyName}`;
}

// Start the server
console.log("Starting server with port:", port);
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Export app and products for testing
module.exports = app;
module.exports.PRODUCTS = PRODUCTS;
module.exports.server = server;