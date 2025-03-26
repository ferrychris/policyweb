// Policy generation
async function generatePolicies(event) {
    event.preventDefault();
    
    const form = document.getElementById('policy-form');
    const formData = new FormData(form);
    const orgName = formData.get('org-name');
    
    // Get selected package
    const selectedPackage = formData.get('package') || 'professional';
    
    // Map packages to number of policies
    const packagePolicyCounts = {
        'basic': 3,
        'professional': 8,
        'premium': 19
    };
    
    // Get policy count based on selected package
    const selectedPolicies = packagePolicyCounts[selectedPackage] || 8;
    
    // Collect all the form data to send to the backend
    const policyData = {
        orgName: formData.get('org-name'),
        industry: formData.get('industry'),
        size: formData.get('size'),
        geoOperations: {
            northAmerica: formData.get('geo-na') === 'on',
            europe: formData.get('geo-eu') === 'on',
            global: formData.get('geo-global') === 'on'
        },
        aiMaturity: formData.get('ai-maturity'),
        aiStrategy: formData.get('ai-strategy'),
        launchpadInterest: formData.get('launchpad-interest') === 'on',
        selectedPackage: selectedPackage,
        policies: {
            // Basic Package (always included)
            ethics: true,
            risk: true,
            data: true,
            
            // Professional Package
            security: selectedPackage === 'professional' || selectedPackage === 'premium',
            model: selectedPackage === 'professional' || selectedPackage === 'premium',
            human: selectedPackage === 'professional' || selectedPackage === 'premium',
            compliance: selectedPackage === 'professional' || selectedPackage === 'premium',
            usecase: selectedPackage === 'professional' || selectedPackage === 'premium',
            
            // Premium Package
            vendor: selectedPackage === 'premium',
            deployment: selectedPackage === 'premium',
            training: selectedPackage === 'premium',
            incident: selectedPackage === 'premium',
            governance: selectedPackage === 'premium',
            transparency: selectedPackage === 'premium',
            // Additional Premium policies (not individually listed but included in package)
            audit: selectedPackage === 'premium',
            ip: selectedPackage === 'premium',
            fairness: selectedPackage === 'premium',
            regulatory: selectedPackage === 'premium',
            improvement: selectedPackage === 'premium',
            stakeholder: selectedPackage === 'premium',
            impact: selectedPackage === 'premium'
        },
        ethics: {
            fairness: formData.get('ethics-fairness') === 'on',
            transparency: formData.get('ethics-transparency') === 'on',
            privacy: formData.get('ethics-privacy') === 'on',
            safety: formData.get('ethics-safety') === 'on'
        },
        risks: {
            technical: formData.get('risk-technical') === 'on',
            ethical: formData.get('risk-ethical') === 'on',
            legal: formData.get('risk-legal') === 'on',
            reputation: formData.get('risk-reputation') === 'on'
        },
        additionalRequirements: formData.get('additional-requirements')
    };

    // All policies require a paid package
    showPaymentOptions(policyData, selectedPolicies);
}

// Show payment options based on package selected
function showPaymentOptions(policyData, selectedPolicies) {
    // Hide the form
    document.getElementById('policy-form').parentElement.parentElement.classList.add('hidden');
    
    // Check if user is logged in as admin
    const isAdmin = localStorage.getItem('admin_authenticated') === 'true';
    
    // If user is admin, skip payment and generate policies directly
    if (isAdmin) {
        console.log("Admin authenticated, generating policies directly");
        try {
            // Generate policies directly for admin
            const policyData = JSON.parse(sessionStorage.getItem('pendingPolicyData'));
            if (policyData) {
                generatePoliciesForUser(policyData);
            } else {
                console.error("No pending policy data found in session storage");
                alert("Error: No policy data found. Please fill out the form again.");
                // Show the form again
                document.getElementById('policy-form').parentElement.parentElement.classList.remove('hidden');
                document.getElementById('results-section').classList.add('hidden');
            }
        } catch (e) {
            console.error("Error parsing policy data:", e);
            alert("An error occurred. Please try again.");
            // Show the form again
            document.getElementById('policy-form').parentElement.parentElement.classList.remove('hidden');
            document.getElementById('results-section').classList.add('hidden');
        }
        return;
    }
    
    // Show payment section for regular users
    const resultsSection = document.getElementById('results-section');
    resultsSection.classList.remove('hidden');
    
    const generatedPolicies = document.getElementById('generated-policies');
    
    // Determine required package based on selected package radio
    const selectedPackage = policyData.selectedPackage || 'professional';
    
    // Map the package values to required package IDs
    const packageMapping = {
        'basic': 'basic_plan',
        'professional': 'professional_package',
        'premium': 'premium_suite'
    };
    
    // Get the required package ID
    const requiredPackage = packageMapping[selectedPackage] || 'professional_package';
    
    // Pricing information
    const packages = {
        basic_plan: { name: 'Basic Package', price: '900', policyCount: 3 },
        professional_package: { name: 'Professional Package', price: '1,500', policyCount: 8 },
        premium_suite: { name: 'Premium Package', price: '5,000', policyCount: 19 }
    };
    
    // Get the required package details
    const requiredPkg = packages[requiredPackage];
    
    // Display payment UI with required package and optional Launchpad service
    let paymentHTML = `
        <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-xl font-bold text-gray-900 mb-4">Payment Required</h3>
            <p class="text-gray-700 mb-4">
                Based on your policy selections, you need the ${requiredPkg.name}.
            </p>
            
            <div class="border rounded-lg p-4 border-indigo-500 bg-indigo-50 mx-auto max-w-xl">
                <div class="flex justify-between items-start">
                    <h4 class="text-lg font-semibold">${requiredPkg.name}</h4>
                    <span class="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">Required</span>
                </div>
                <p class="text-2xl font-bold my-2">$${requiredPkg.price}</p>
                <p class="text-sm text-gray-600 mb-4">Includes ${requiredPkg.policyCount} policy templates</p>
            </div>
    `;
    
    // Add AI Launchpad offer if user showed interest
    if (policyData.launchpadInterest) {
        paymentHTML += `
            <div class="mt-6 border rounded-lg p-4 border-blue-500 bg-blue-50 mx-auto max-w-xl">
                <div class="flex justify-between items-start">
                    <h4 class="text-lg font-semibold">AI Strategy Launchpad</h4>
                    <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Optional</span>
                </div>
                <p class="text-2xl font-bold my-2">$3,500</p>
                <p class="text-sm text-gray-600 mb-4">Comprehensive AI strategy development engagement</p>
                <div class="bg-white p-3 rounded-lg text-sm mb-4">
                    <p class="mb-2"><strong>The AI Launchpad includes:</strong></p>
                    <ul class="list-disc pl-5 space-y-1">
                        <li>Initial assessment of your organization's AI readiness</li>
                        <li>2 half-day facilitated workshops with key stakeholders</li>
                        <li>AI opportunity identification and prioritization</li>
                        <li>Customized AI roadmap development</li>
                        <li>Implementation planning and governance recommendations</li>
                        <li>Executive presentation of strategy and next steps</li>
                    </ul>
                </div>
                <div class="flex items-center space-x-2">
                    <input id="include-launchpad" name="include-launchpad" type="checkbox" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                    <label for="include-launchpad" class="text-sm font-medium text-gray-700">Add AI Strategy Launchpad to my order (+$3,500)</label>
                </div>
            </div>
        `;
    }
    
    // Add proceed button and back button
    paymentHTML += `
            <div class="mt-6 text-center">
                <button 
                    type="button" 
                    class="w-full max-w-xl py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onclick="startPaymentProcess('${requiredPackage}', '${policyData.orgName}')"
                >
                    Proceed to Payment
                </button>
            </div>
            
            <div class="mt-4 flex justify-between">
                <button 
                    type="button" 
                    class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onclick="backToForm()"
                >
                    <i class="fas fa-arrow-left mr-2"></i> Back
                </button>
                
                ${policyData.launchpadInterest ? `
                <a href="launchpad.html" target="_blank" class="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <i class="fas fa-info-circle mr-2"></i> Learn More About AI Launchpad
                </a>
                ` : ''}
            </div>
            
            <!-- Admin Login Option -->
            <div class="mt-6 border-t border-gray-200 pt-4">
                <div class="flex items-center justify-center">
                    <button type="button" onclick="showAdminLogin()" class="text-sm text-gray-500 hover:text-indigo-600 flex items-center">
                        <i class="fas fa-lock mr-1"></i> Administrator Access
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Admin Login Modal (Initially Hidden) -->
        <div id="admin-login-modal" class="hidden fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg max-w-md w-full p-6">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-lg font-medium text-gray-900">Administrator Login</h3>
                    <button type="button" onclick="closeAdminLogin()" class="text-gray-400 hover:text-gray-500">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="mb-4">
                    <label for="admin-password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input type="password" id="admin-password" class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <div id="admin-error" class="text-red-500 text-xs mt-1 hidden">Incorrect password</div>
                </div>
                <div class="flex justify-end">
                    <button type="button" onclick="verifyAdminAccess()" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Login
                    </button>
                </div>
            </div>
        </div>
    `;
    
    generatedPolicies.innerHTML = paymentHTML;
    
    // Store policy data in sessionStorage to retrieve after payment
    sessionStorage.setItem('pendingPolicyData', JSON.stringify(policyData));
    sessionStorage.setItem('selectedPolicyCount', selectedPolicies);
}

// Go back to the questionnaire form
function backToForm() {
    // Hide results section
    document.getElementById('results-section').classList.add('hidden');
    
    // Show the form again
    document.getElementById('policy-form').parentElement.parentElement.classList.remove('hidden');
}

// Start the payment process
function startPaymentProcess(productId, customerEmail) {
    // Check if launchpad is included
    const includeLaunchpad = document.getElementById('include-launchpad') && document.getElementById('include-launchpad').checked;
    const policyData = JSON.parse(sessionStorage.getItem('pendingPolicyData'));
    
    // Calculate total amount
    let totalAmount = 0;
    let summary = '';
    
    // Add package price
    const packages = {
        basic_plan: { name: 'Basic Package', price: 900 },
        professional_package: { name: 'Professional Package', price: 1500 },
        premium_suite: { name: 'Premium Package', price: 5000 }
    };
    
    const packagePrice = packages[productId].price;
    totalAmount += packagePrice;
    summary += `<div class="flex justify-between border-b pb-2 mb-2">
        <span>${packages[productId].name}</span>
        <span>$${packagePrice.toLocaleString()}</span>
    </div>`;
    
    // Add launchpad price if selected
    if (includeLaunchpad) {
        totalAmount += 3500;
        summary += `<div class="flex justify-between border-b pb-2 mb-2">
            <span>AI Strategy Launchpad</span>
            <span>$3,500</span>
        </div>`;
        
        // Update session storage to include launchpad
        policyData.includeLaunchpad = true;
        sessionStorage.setItem('pendingPolicyData', JSON.stringify(policyData));
    }
    
    // Create a payment element container with contact fields
    const generatedPolicies = document.getElementById('generated-policies');
    generatedPolicies.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-xl font-bold text-gray-900 mb-4">Complete Your Purchase</h3>
            
            <div class="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-2">Order Summary</h4>
                ${summary}
                <div class="flex justify-between font-medium text-lg mt-4">
                    <span>Total:</span>
                    <span>$${totalAmount.toLocaleString()}</span>
                </div>
            </div>
            
            <form id="payment-form" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                    <!-- Contact Information -->
                    <div class="md:col-span-2">
                        <h4 class="font-medium text-gray-900 mb-3">Contact Information</h4>
                    </div>
                    
                    <!-- Full Name -->
                    <div>
                        <label for="customer-name" class="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" id="customer-name" name="customer-name" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required>
                    </div>
                    
                    <!-- Email -->
                    <div>
                        <label for="customer-email" class="block text-sm font-medium text-gray-700">Email Address</label>
                        <input type="email" id="customer-email" name="customer-email" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required>
                    </div>
                    
                    <!-- Phone Number -->
                    <div>
                        <label for="customer-phone" class="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input type="tel" id="customer-phone" name="customer-phone" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required>
                    </div>
                    
                    <!-- Company -->
                    <div>
                        <label for="customer-company" class="block text-sm font-medium text-gray-700">Company</label>
                        <input type="text" id="customer-company" name="customer-company" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required>
                    </div>
                    
                    <!-- Role -->
                    <div>
                        <label for="customer-role" class="block text-sm font-medium text-gray-700">Job Role</label>
                        <input type="text" id="customer-role" name="customer-role" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required>
                    </div>
                    
                    <!-- Address -->
                    <div class="md:col-span-2">
                        <label for="customer-address" class="block text-sm font-medium text-gray-700">Address</label>
                        <input type="text" id="customer-address" name="customer-address" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required placeholder="Street address">
                    </div>
                    
                    <!-- City, State/Province, Zip -->
                    <div>
                        <label for="customer-city" class="block text-sm font-medium text-gray-700">City</label>
                        <input type="text" id="customer-city" name="customer-city" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required>
                    </div>
                    
                    <div>
                        <label for="customer-state" class="block text-sm font-medium text-gray-700">State/Province</label>
                        <input type="text" id="customer-state" name="customer-state" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required>
                    </div>
                    
                    <div>
                        <label for="customer-zip" class="block text-sm font-medium text-gray-700">Postal Code</label>
                        <input type="text" id="customer-zip" name="customer-zip" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required>
                    </div>
                    
                    <div>
                        <label for="customer-country" class="block text-sm font-medium text-gray-700">Country</label>
                        <input type="text" id="customer-country" name="customer-country" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required>
                    </div>
                </div>
                
                <!-- Payment Information -->
                <div>
                    <h4 class="font-medium text-gray-900 mb-3">Payment Information</h4>
                    <p class="text-sm text-gray-500 mb-3">All transactions are secure and encrypted. Credit card information is never stored on our servers.</p>
                    <div class="bg-gray-50 border border-gray-300 rounded-md p-4">
                        <div id="payment-element-container">
                            <!-- Stripe Elements will be inserted here -->
                            <div id="payment-element" class="bg-white border border-gray-300 rounded-md shadow-sm p-4 min-h-[40px]"></div>
                            <div id="card-errors" class="text-red-500 text-sm mt-2"></div>
                        </div>
                        <p class="text-xs text-gray-500 mt-3 flex items-center">
                            <i class="fas fa-lock mr-1"></i> Secured by Stripe
                        </p>
                    </div>
                </div>
                
                <div class="flex justify-between">
                    <button 
                        type="button" 
                        class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onclick="showPaymentOptions(JSON.parse(sessionStorage.getItem('pendingPolicyData')), sessionStorage.getItem('selectedPolicyCount'))"
                    >
                        <i class="fas fa-arrow-left mr-2"></i> Back
                    </button>
                    
                    <button 
                        id="payment-submit-button" 
                        type="submit"
                        class="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Complete Purchase
                    </button>
                </div>
            </form>
        </div>
    `;
    
    // Initialize Stripe payment
    initializePayment(productId, customerEmail, includeLaunchpad);
}

// This function has been removed as all policies now require payment

// Core policy generation function (called after any payment considerations)
async function generatePoliciesForUser(policyData) {
    const orgName = policyData.orgName;
    
    // Store organization name globally for sub-policy generation
    window.organizationName = orgName;
    
    // Hide the form or payment UI
    document.getElementById('policy-form').parentElement.parentElement.classList.add('hidden');
    
    // Show loading state in results section
    const resultsSection = document.getElementById('results-section');
    resultsSection.classList.remove('hidden');
    
    const generatedPolicies = document.getElementById('generated-policies');
    generatedPolicies.innerHTML = `
        <div class="flex justify-center items-center py-10">
            <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
            <p class="ml-4 text-lg text-gray-700">Generating custom policies for ${orgName}...</p>
        </div>
    `;
    
    try {
        // Generate policies directly in the browser
        // This is a workaround for server issues
        console.log("Generating policies locally for", policyData.orgName);
        
        // Create static templates for each policy type
        const templateContents = {
            ethics: `# AI Ethics Policy for ${orgName}

## Policy Number: ETH-AI-001
## Effective Date: ${new Date().toLocaleDateString()}
## Version: 1.0

## Purpose and Scope

This AI Ethics Policy establishes the ethical principles and requirements that must be followed in the design, development, deployment, and use of artificial intelligence systems at ${orgName}. This policy applies to all employees, contractors, and third parties who design, develop, deploy, procure, or use AI systems on behalf of our organization.

## Ethical Principles

1. **Fairness and Non-discrimination**: AI systems must be designed to treat all individuals fairly and without discrimination based on protected characteristics such as race, gender, age, disability, or other attributes.

2. **Transparency and Explainability**: AI systems should be transparent in their operations, and their decisions should be explainable to the extent technically feasible.

3. **Privacy and Data Protection**: AI systems must respect privacy rights and protect personal data in accordance with applicable laws and regulations.

4. **Safety and Security**: AI systems must be designed and operated safely, with appropriate security measures to prevent unauthorized access or harmful outcomes.

5. **Human Oversight**: AI systems should support human autonomy and decision-making, with appropriate human oversight for high-risk applications.

## Implementation Guidelines

1. Conduct ethics impact assessments for all AI systems prior to development or procurement.
2. Design AI systems with fairness and inclusivity in mind from the outset.
3. Ensure AI systems are sufficiently transparent and can produce explanations for their decisions.
4. Implement appropriate data governance practices to protect privacy and ensure data quality.
5. Establish human oversight mechanisms for AI systems, especially for high-risk applications.
6. Provide ethical AI training to all relevant employees.
7. Regularly audit AI systems for bias and other ethical issues.

## Roles and Responsibilities

- **AI Ethics Committee**: Oversees implementation of this policy, reviews high-risk AI use cases, and provides guidance on ethical AI use.
- **AI Development Teams**: Implement ethical principles in AI system design and development.
- **Data Science Leaders**: Ensure AI models are trained on appropriate datasets and tested for bias.
- **Legal and Compliance**: Monitor changing regulations related to AI ethics and ensure organizational compliance.
- **Business Units**: Report potential ethical issues with AI systems to the AI Ethics Committee.

## Compliance and Reporting

Any employee who becomes aware of potential violations of this policy should report their concerns to the AI Ethics Committee or through established reporting channels. Violations of this policy may result in disciplinary action.

## Review and Updates

This policy will be reviewed annually by the AI Ethics Committee to ensure it remains effective and aligned with emerging ethical standards and regulatory requirements.`,

            risk: `# AI Risk Management Policy for ${orgName}

## Policy Number: RISK-AI-001
## Effective Date: ${new Date().toLocaleDateString()}
## Version: 1.0

## Purpose and Scope

This AI Risk Management Policy establishes a structured approach to identifying, assessing, and mitigating risks associated with artificial intelligence systems at ${orgName}. This policy applies to all AI systems developed, deployed, or used by the organization.

## Risk Categories

1. **Technical Risks**: Including issues related to accuracy, reliability, robustness, security vulnerabilities, and technical failures.

2. **Ethical Risks**: Including bias, fairness concerns, privacy violations, lack of transparency, and potential for misuse.

3. **Legal and Compliance Risks**: Including regulatory violations, intellectual property issues, liability concerns, and contractual obligations.

4. **Reputational Risks**: Including public perception issues, stakeholder trust, and brand impact from AI use.

## Risk Management Framework

### 1. Risk Identification

- Conduct initial risk assessments for all AI systems before development or acquisition
- Document potential risks across all risk categories
- Consider both direct and indirect impacts on stakeholders

### 2. Risk Assessment

- Evaluate the likelihood and potential impact of identified risks
- Prioritize risks based on severity and probability
- Classify AI systems into risk tiers (high, medium, low)

### 3. Risk Mitigation

- Develop specific controls and safeguards for each identified risk
- Implement technical measures to address AI-specific vulnerabilities
- Establish monitoring mechanisms for ongoing risk detection

### 4. Risk Monitoring and Reporting

- Continuously monitor AI systems for emerging risks
- Conduct periodic risk reassessments
- Report significant risks to senior management

## Roles and Responsibilities

- **Risk Management Team**: Oversees the AI risk management process
- **AI Development Teams**: Implement technical safeguards and participate in risk assessment
- **Business Units**: Identify business-specific risks and implement operational controls
- **Legal and Compliance**: Assess regulatory risks and ensure compliance
- **Senior Management**: Review high-risk AI initiatives and provide governance

## Risk Documentation

All AI systems must maintain the following risk documentation:
- Initial risk assessment report
- Risk mitigation plan
- Ongoing monitoring results
- Incident reports (if applicable)

## Review and Updates

This policy will be reviewed annually and updated as needed to address emerging risks and changing regulatory requirements.`,

            data: `# AI Data Governance Policy for ${orgName}

## Policy Number: DATA-AI-001
## Effective Date: ${new Date().toLocaleDateString()}
## Version: 1.0

## Purpose and Scope

This AI Data Governance Policy establishes requirements for the management of data used in artificial intelligence systems at ${orgName}. This policy applies to all data collected, processed, or used for AI development, training, validation, or operation.

## Data Quality and Integrity

1. **Data Quality Assessment**: All datasets used for AI must undergo quality assessment to identify missing values, outliers, and inconsistencies.

2. **Data Cleaning Protocols**: Standardized methods must be used to address data quality issues, with all cleaning steps documented.

3. **Data Validation**: Datasets must be validated before use in AI training to ensure accuracy and completeness.

4. **Data Integrity Monitoring**: Ongoing monitoring of data integrity throughout the AI lifecycle.

## Data Privacy and Security

1. **Privacy by Design**: AI systems must implement privacy by design principles, minimizing personal data use.

2. **Data Minimization**: Only collect and retain data necessary for the specific AI purpose.

3. **Data Security**: Implement appropriate technical and organizational measures to protect AI datasets.

4. **Access Controls**: Restrict access to AI training and operational data on a need-to-know basis.

5. **Data Encryption**: Encrypt sensitive data used in AI systems both in transit and at rest.

## Data Bias and Fairness

1. **Bias Assessment**: Datasets must be assessed for potential biases before use in AI training.

2. **Representative Sampling**: Ensure training datasets are representative of the populations the AI will serve.

3. **Fairness Metrics**: Establish appropriate fairness metrics for each AI use case.

4. **Bias Mitigation**: Implement techniques to identify and mitigate bias in datasets.

## Data Lineage and Documentation

1. **Data Provenance**: Maintain records of data sources, collection methods, and ownership.

2. **Dataset Documentation**: Create dataset documentation including purpose, composition, collection methodology, and limitations.

3. **Version Control**: Implement version control for all AI datasets.

4. **Dataset Updates**: Document all modifications to datasets used in AI systems.

## Roles and Responsibilities

- **Data Governance Team**: Oversees implementation of data governance controls
- **AI Development Teams**: Ensure data quality and implement appropriate safeguards
- **Data Stewards**: Manage datasets and maintain documentation
- **Privacy Office**: Ensure compliance with privacy requirements
- **Security Team**: Implement data security controls

## Compliance and Monitoring

Regular audits will be conducted to ensure compliance with this policy. Non-compliance may result in remediation requirements or restrictions on AI system deployment.

## Review and Updates

This policy will be reviewed annually to ensure it remains effective and aligned with emerging best practices and regulatory requirements.`,

            security: `# AI Security Policy for ${orgName}

## Policy Number: SEC-AI-001
## Effective Date: ${new Date().toLocaleDateString()}
## Version: 1.0

## Purpose and Scope

This AI Security Policy establishes security requirements for artificial intelligence systems at ${orgName}. This policy applies to all AI systems developed, deployed, or used by the organization and aims to protect against security vulnerabilities specific to AI technologies.

## AI Security Requirements

### 1. Access Controls and Authentication

- Implement role-based access controls for all AI systems
- Use multi-factor authentication for access to high-sensitivity AI applications
- Maintain audit logs of all access to AI systems and training data
- Review access privileges quarterly

### 2. Model Security

- Protect AI models against unauthorized access or extraction
- Implement safeguards against model poisoning and evasion attacks
- Conduct regular security testing of AI models
- Use secure methods for model updates and versioning

### 3. Input Validation and Adversarial Defenses

- Validate all inputs to AI systems to prevent adversarial attacks
- Implement adversarial defenses appropriate to the AI technology
- Test AI systems against common adversarial examples
- Monitor for suspicious inputs that may indicate an attack

### 4. Training Data Security

- Secure all training datasets with appropriate controls
- Implement data encryption for sensitive training data
- Conduct security reviews before incorporating new training data
- Control and monitor access to training datasets

### 5. Deployment Security

- Conduct security reviews before AI system deployment
- Implement secure API design for AI services
- Use containerization and isolation for AI system deployment
- Monitor deployed AI systems for security anomalies

### 6. Third-party AI Security

- Assess security controls of third-party AI services before approval
- Include security requirements in contracts with AI vendors
- Regularly review security practices of third-party AI providers
- Maintain contingency plans for third-party AI security incidents

## Security Testing and Monitoring

- Conduct regular penetration testing of AI systems
- Include AI-specific scenarios in security exercises
- Monitor AI systems for unusual behavior that may indicate compromise
- Implement automated security scanning for AI codebases

## Incident Response

- Develop AI-specific incident response procedures
- Define escalation paths for AI security incidents
- Document and analyze all AI security incidents
- Conduct post-incident reviews and update security controls

## Roles and Responsibilities

- **Security Team**: Oversee implementation of AI security controls
- **AI Development Teams**: Implement security features in AI systems
- **Operations Teams**: Monitor deployed AI systems for security issues
- **Risk Management**: Assess security risks of AI systems
- **Senior Management**: Ensure adequate resources for AI security

## Compliance and Enforcement

Compliance with this policy is mandatory. Violations may result in remediation requirements, system decommissioning, or disciplinary action as appropriate.

## Review and Updates

This policy will be reviewed annually to ensure it addresses emerging AI security threats and best practices.`,

            model: `# AI Model Management Policy for ${orgName}

## Policy Number: MDL-AI-001
## Effective Date: ${new Date().toLocaleDateString()}
## Version: 1.0

## Purpose and Scope

This AI Model Management Policy establishes requirements for the development, deployment, and maintenance of artificial intelligence models at ${orgName}. This policy applies to all machine learning and AI models developed, deployed, or used by the organization.

## Model Development

### 1. Model Planning and Design

- Document business requirements and success criteria before model development
- Conduct feasibility assessments for proposed AI models
- Design models with transparency and explainability considerations
- Select appropriate algorithms based on use case requirements

### 2. Training and Validation

- Use representative and balanced datasets for model training
- Implement cross-validation techniques to assess model performance
- Document all hyperparameter settings and optimization methods
- Maintain separation between training, validation, and test datasets
- Verify model performance across different demographic groups

### 3. Testing and Evaluation

- Establish minimum performance thresholds for model deployment
- Test models with diverse, real-world data scenarios
- Evaluate models for potential biases and fairness issues
- Document all test results and evaluation metrics
- Conduct adversarial testing where appropriate

## Model Documentation

All AI models must have complete documentation including:

- Model purpose and intended use cases
- Data sources and processing methods
- Model architecture and algorithms
- Training procedures and parameters
- Performance metrics and limitations
- Fairness evaluations
- Risk assessments
- Version information and change history

## Model Deployment

### 1. Deployment Requirements

- Complete pre-deployment checklist before moving to production
- Implement gradual rollout strategies for high-risk models
- Deploy models with appropriate monitoring capabilities
- Maintain fallback mechanisms for model failures

### 2. Production Integration

- Ensure proper integration with production systems
- Verify data pipelines for production data
- Implement appropriate security controls
- Document all production environment details

## Model Monitoring and Maintenance

### 1. Ongoing Monitoring

- Monitor model performance against established metrics
- Implement drift detection for both data and concept drift
- Track model usage and user feedback
- Set up alerting for abnormal model behavior

### 2. Model Updates and Retraining

- Establish criteria for model retraining
- Document all model updates and changes
- Validate updated models before redeployment
- Maintain version control for all model iterations

### 3. Model Retirement

- Define criteria for model retirement
- Document retirement decisions and rationale
- Ensure proper archiving of retired models
- Plan for successor models or alternatives

## Roles and Responsibilities

- **AI Model Owners**: Responsible for overall model lifecycle
- **Data Scientists**: Develop and optimize models
- **ML Engineers**: Deploy and integrate models
- **Model Validators**: Independently verify model performance
- **Operations Teams**: Monitor deployed models

## Compliance and Governance

- Conduct regular audits of model documentation and performance
- Report on model performance to relevant stakeholders
- Maintain inventory of all AI models
- Ensure compliance with relevant regulations

## Review and Updates

This policy will be reviewed annually to ensure it remains effective and aligned with emerging best practices and technologies.`,

            human: `# AI Human Oversight Policy for ${orgName}

## Policy Number: HUM-AI-001
## Effective Date: ${new Date().toLocaleDateString()}
## Version: 1.0

## Purpose and Scope

This AI Human Oversight Policy establishes requirements for maintaining appropriate human supervision and control over artificial intelligence systems at ${orgName}. This policy applies to all AI systems developed, deployed, or used by the organization.

## Human Oversight Principles

1. **Appropriate Control**: AI systems should support human decision-making, not replace human judgment in critical areas.

2. **Meaningful Oversight**: Humans must have the ability to understand, intervene, and override AI systems when necessary.

3. **Clear Accountability**: Human responsibilities for AI system outcomes must be clearly defined.

4. **Capability Awareness**: Users must understand AI capabilities and limitations to provide effective oversight.

5. **Continuous Improvement**: Human oversight mechanisms should be regularly evaluated and improved.

## Human Oversight Requirements

### 1. AI System Classification

All AI systems must be classified into one of the following oversight categories:

- **Full Autonomy**: Minimal risk applications where AI can operate without direct human supervision
- **Guided Autonomy**: Medium risk applications where AI operates with periodic human review
- **Shared Control**: High risk applications where AI makes recommendations but humans make final decisions
- **Human Command**: Critical applications where AI only executes explicit human instructions

### 2. Oversight Design Requirements

- Document human oversight mechanisms for each AI system
- Design user interfaces that facilitate effective human oversight
- Implement appropriate escalation paths for AI system issues
- Ensure humans have sufficient time and information to exercise meaningful oversight
- Provide mechanisms to capture human feedback on AI performance

### 3. Explainability Requirements

- Ensure AI systems provide explanations appropriate to their oversight category
- Design explanations suitable for the intended human operators
- Document known limitations in AI system explainability
- Provide additional information resources for complex AI decisions

### 4. Human Intervention Capabilities

- Implement pause and override controls for all high-risk AI systems
- Ensure intervention controls are accessible and responsive
- Test intervention capabilities periodically
- Document all instances of necessary human intervention

## Training and Competency

- Provide training on AI capabilities and limitations for all operators
- Establish competency requirements for human overseers based on AI risk level
- Conduct regular refresher training as AI systems evolve
- Evaluate overseer performance and effectiveness

## Documentation and Review

- Maintain documentation of oversight mechanisms for each AI system
- Record significant human interventions and their outcomes
- Periodically review the effectiveness of human oversight procedures
- Update oversight requirements based on operational experience

## Roles and Responsibilities

- **AI System Owners**: Define appropriate oversight requirements for their systems
- **Human Operators**: Exercise effective oversight and document issues
- **AI Development Teams**: Implement required oversight capabilities
- **Training Teams**: Develop and deliver oversight training programs
- **Management**: Ensure adequate resources for effective human oversight

## Compliance and Exceptions

Compliance with this policy is mandatory for all AI systems. Exceptions may be granted only with documented risk assessment and approval from the AI Governance Committee.

## Review and Updates

This policy will be reviewed annually to ensure it remains effective and incorporates lessons learned from operational experience.`,

            compliance: `# AI Compliance Policy for ${orgName}

## Policy Number: REG-AI-001
## Effective Date: ${new Date().toLocaleDateString()}
## Version: 1.0

## Purpose and Scope

This AI Compliance Policy establishes requirements for ensuring artificial intelligence systems at ${orgName} comply with applicable laws, regulations, and standards. This policy applies to all AI systems developed, deployed, or used by the organization.

## Regulatory Compliance Requirements

### 1. General Compliance Obligations

- Identify and document all regulations applicable to each AI system
- Maintain a compliance register for AI-specific regulatory requirements
- Establish compliance verification procedures for each AI system
- Perform regular compliance assessments

### 2. Regional and Sectoral Regulations

- Ensure compliance with jurisdiction-specific AI regulations
- Implement controls to meet sector-specific requirements
- Monitor regulatory developments in all operating regions
- Establish processes to adapt to new regulatory requirements

### 3. Data Protection and Privacy

- Comply with all applicable data protection and privacy laws
- Implement privacy by design principles in AI development
- Conduct privacy impact assessments for AI systems processing personal data
- Maintain records of processing activities involving personal data

### 4. Non-discrimination and Fairness

- Ensure AI systems comply with anti-discrimination laws
- Implement controls to detect and mitigate algorithmic bias
- Document fairness assessments for high-risk AI applications
- Verify compliance with equality requirements

### 5. Consumer Protection

- Comply with consumer protection regulations relevant to AI
- Ensure transparent communication about AI capabilities
- Implement appropriate disclosure requirements
- Maintain mechanisms for consumer complaints related to AI

## Compliance Documentation

All AI systems must maintain the following compliance documentation:

- Regulatory register identifying applicable requirements
- Compliance assessment reports
- Evidence of compliance controls
- Certification documentation (where applicable)
- Audit results
- Remediation plans for any compliance gaps

## Compliance Monitoring and Testing

- Conduct regular compliance testing for all AI systems
- Implement monitoring controls to detect compliance issues
- Perform periodic compliance audits
- Track regulatory changes affecting AI systems

## Incident Response and Reporting

- Establish procedures for handling compliance incidents
- Define regulatory reporting requirements for AI-related incidents
- Document all compliance incidents and remediation actions
- Report significant compliance issues to senior management

## Roles and Responsibilities

- **Compliance Team**: Oversee AI regulatory compliance program
- **Legal Department**: Interpret regulatory requirements and provide guidance
- **AI Development Teams**: Implement compliance requirements in AI systems
- **Business Units**: Ensure operational compliance with AI regulations
- **Senior Management**: Ultimate responsibility for regulatory compliance

## Training and Awareness

- Provide compliance training for all staff involved with AI systems
- Conduct specialized training for high-risk AI applications
- Maintain awareness of emerging regulatory requirements
- Document completion of compliance training

## Review and Updates

This policy will be reviewed annually and updated as needed to address regulatory changes and emerging compliance requirements.`,

            usecase: `# AI Use Case Evaluation Policy for ${orgName}

## Policy Number: UC-AI-001
## Effective Date: ${new Date().toLocaleDateString()}
## Version: 1.0

## Purpose and Scope

This AI Use Case Evaluation Policy establishes a structured process for evaluating, approving, and prioritizing artificial intelligence use cases at ${orgName}. This policy applies to all proposed and existing AI applications across the organization.

## Use Case Evaluation Process

### 1. Initial Proposal

All AI use cases must be formally proposed using the standard AI Use Case Proposal Template, which includes:

- Business problem and objectives
- Expected benefits and success metrics
- Data requirements and availability
- Resource requirements
- Timeline and milestones
- Preliminary risk assessment

### 2. Use Case Classification

All proposed AI use cases must be classified based on:

- **Risk Level**: High, Medium, or Low based on potential impacts
- **Strategic Alignment**: Critical, Important, or Supportive to business strategy
- **Implementation Complexity**: Complex, Moderate, or Simple
- **Data Sensitivity**: Highly Sensitive, Sensitive, or Non-sensitive

### 3. Detailed Evaluation

Use cases that pass initial screening undergo detailed evaluation including:

- Technical feasibility assessment
- Comprehensive risk assessment
- Resource requirements analysis
- Return on investment calculation
- Implementation timeline validation
- Legal and compliance review

### 4. Approval Requirements

Approval requirements vary by classification:

- **High Risk/Critical**: Requires AI Governance Committee approval
- **Medium Risk**: Requires departmental leadership and AI team approval
- **Low Risk**: Requires AI team approval only

## Evaluation Criteria

### 1. Business Value

- Clear business problem with measurable success criteria
- Quantifiable benefits (financial or operational)
- Strategic alignment with organizational priorities
- Stakeholder support and commitment

### 2. Technical Feasibility

- Data availability, quality, and suitability
- Technical infrastructure requirements
- Algorithm selection and performance expectations
- Integration requirements

### 3. Risk Assessment

- Potential for bias or unfair outcomes
- Privacy and security concerns
- Regulatory compliance requirements
- Reputational and ethical considerations
- Operational impacts of potential failures

### 4. Implementation Requirements

- Resource requirements (human and financial)
- Timeline and dependencies
- Change management needs
- Ongoing maintenance considerations

## Documentation Requirements

All AI use cases must maintain documentation including:

- Original proposal and evaluation results
- Risk assessment and mitigation plans
- Approval decisions and conditions
- Implementation plans
- Post-implementation review results

## Use Case Monitoring and Review

- Track implementation progress against milestones
- Measure performance against success criteria
- Conduct post-implementation reviews
- Update risk assessments periodically
- Re-evaluate use cases when significant changes occur

## Roles and Responsibilities

- **Business Sponsors**: Submit use case proposals and provide subject matter expertise
- **AI Evaluation Team**: Conduct technical and feasibility assessments
- **Risk and Compliance**: Assess legal, ethical, and regulatory considerations
- **AI Governance Committee**: Review and approve high-risk use cases
- **Project Management Office**: Track use case implementation

## Review and Updates

This policy will be reviewed annually to ensure it effectively supports organizational goals while managing AI-related risks.`,

            vendor: `# AI Procurement & Vendor Management Policy for ${orgName}

## Policy Number: PROC-AI-001
## Effective Date: ${new Date().toLocaleDateString()}
## Version: 1.0

## Purpose and Scope

This AI Procurement & Vendor Management Policy establishes requirements for the assessment, selection, and management of artificial intelligence vendors and third-party AI services at ${orgName}. This policy applies to all external AI products, services, and partnerships.

## Vendor Assessment and Selection

### 1. Pre-qualification Requirements

All AI vendors must meet minimum requirements before detailed evaluation:

- Demonstrated AI expertise and relevant experience
- Compliance with applicable regulations
- Financial stability and business continuity capabilities
- Security certification or audit results
- Privacy program and data protection capabilities

### 2. Technical Evaluation

Vendors must be evaluated on technical capabilities including:

- AI model performance and accuracy metrics
- Transparency and explainability features
- Fairness and bias assessment results
- Technical architecture and scalability
- Customization capabilities
- Model monitoring and management tools
- Integration capabilities with existing systems

### 3. Risk Assessment

Comprehensive risk assessment including:

- Data security and privacy risks
- Model risk (accuracy, bias, robustness)
- Operational risks and dependencies
- Legal and compliance risks
- Reputational risks
- Vendor lock-in considerations

### 4. Procurement Requirements

AI procurement must include:

- Clear specification of requirements and success criteria
- Definition of performance metrics and acceptance criteria
- Model evaluation period with representative data
- Right to audit and performance validation
- Data rights and intellectual property provisions
- Exit and transition provisions

## Contractual Requirements

All AI vendor contracts must include provisions for:

### 1. Performance and Quality

- Defined service levels and performance metrics
- Regular performance reporting requirements
- Remediation procedures for performance issues
- Model update and improvement processes

### 2. Data Protection and Security

- Data processing agreement with appropriate safeguards
- Security requirements and breach notification procedures
- Data usage limitations and purpose specifications
- Data deletion and return requirements

### 3. Explainability and Transparency

- Requirements for model documentation
- Explainability features appropriate to use case
- Disclosure of model limitations
- Algorithm change notification requirements

### 4. Compliance and Audit

- Compliance with relevant AI regulations
- Audit rights and compliance verification
- Regulatory change adaptation requirements
- Regular compliance assessments

## Vendor Management

### 1. Performance Monitoring

- Regular vendor performance reviews
- Tracking of key performance indicators
- Validation of model performance claims
- Issue escalation procedures

### 2. Relationship Management

- Defined governance structure for vendor relationship
- Regular business reviews
- Roadmap alignment and planning
- Innovation and improvement processes

### 3. Risk Management

- Ongoing vendor risk assessments
- Monitoring of changes to vendor organization or offerings
- Contingency planning for vendor issues
- Regular security and compliance reviews

## Roles and Responsibilities

- **Procurement**: Lead vendor selection process and contract negotiation
- **AI Team**: Technical evaluation and performance monitoring
- **Legal**: Contract review and compliance verification
- **Security**: Security assessment and ongoing monitoring
- **Business Units**: Requirements definition and performance validation

## Documentation Requirements

Maintain comprehensive documentation for all AI vendors including:

- Selection process and evaluation results
- Contracts and service level agreements
- Performance reports and review outcomes
- Risk assessments and mitigation plans
- Incident reports and resolutions

## Review and Updates

This policy will be reviewed annually to ensure it remains effective and incorporates lessons learned from vendor relationships.`,

            deployment: `# Responsible AI Deployment Policy for ${orgName}

## Policy Number: DEPLOY-AI-001
## Effective Date: ${new Date().toLocaleDateString()}
## Version: 1.0

## Purpose and Scope

This Responsible AI Deployment Policy establishes requirements for the safe, ethical, and effective deployment of artificial intelligence systems at ${orgName}. This policy applies to all AI systems being released to production environments or external users.

## Pre-Deployment Requirements

### 1. Deployment Readiness Assessment

Before any AI system deployment, the following must be completed and documented:

- Technical validation against performance requirements
- Bias and fairness testing results
- Security assessment and vulnerability testing
- Privacy impact assessment
- Explainability evaluation
- Load and stress testing
- Integration testing with target systems
- User acceptance testing

### 2. Deployment Approval

All AI deployments require formal approval from:

- AI System Owner
- Security Team Representative
- Privacy Officer (for systems processing personal data)
- Business Unit Leader
- AI Governance Committee (for high-risk systems)

### 3. Deployment Planning

A deployment plan must be created that includes:

- Deployment strategy (phased rollout, A/B testing, etc.)
- Rollback procedures
- Performance monitoring approach
- User communication plan
- Training requirements
- Support procedures

## Deployment Methodologies

### 1. Phased Deployment

- High-risk AI systems must use phased deployment approaches
- Progressive exposure to increasingly larger user groups
- Performance validation at each phase
- Clear criteria for proceeding to next phase

### 2. Deployment Environments

- Maintain separate development, testing, and production environments
- Implement access controls appropriate to each environment
- Document configuration requirements for each environment
- Test environment-specific issues before production deployment

### 3. Deployment Automation

- Use version control for all deployment artifacts
- Implement deployment automation where feasible
- Maintain deployment logs and records
- Validate deployed versions match approved versions

## Monitoring and Feedback

### 1. Initial Deployment Monitoring

- Implement heightened monitoring for newly deployed AI systems
- Monitor system performance, accuracy, and stability
- Track user feedback and experience
- Watch for unexpected behaviors or outcomes

### 2. Performance Dashboards

- Create monitoring dashboards for key metrics
- Include both technical and business performance indicators
- Set up alerting for threshold violations
- Make dashboards accessible to appropriate stakeholders

### 3. Feedback Collection

- Implement mechanisms to collect user feedback
- Establish processes to analyze and respond to feedback
- Document all significant issues and resolutions
- Use feedback to inform future improvements

## Issue Management

### 1. Incident Response

- Define AI-specific incident categories and response procedures
- Establish escalation paths for different incident types
- Document standard troubleshooting approaches
- Set target resolution timeframes

### 2. Emergency Mitigation

- Define criteria for emergency actions (containment, shutdown)
- Establish authority for emergency decisions
- Document emergency procedures for all AI systems
- Test emergency procedures periodically

## Post-Deployment Activities

### 1. Post-Implementation Review

- Conduct formal review after significant deployments
- Assess performance against success criteria
- Document lessons learned
- Update deployment procedures based on experience

### 2. Ongoing Improvement

- Establish regular cadence for AI system updates
- Prioritize improvements based on deployment feedback
- Follow change management process for updates
- Maintain full deployment history

## Roles and Responsibilities

- **AI Development Team**: Prepare systems for deployment and resolve technical issues
- **Operations Team**: Execute deployment procedures and monitor systems
- **Business Owners**: Validate business requirements and approve user impact
- **Security and Privacy Teams**: Ensure deployed systems meet requirements
- **Support Teams**: Handle user issues and feedback

## Documentation Requirements

Maintain comprehensive documentation for all AI deployments including:

- Deployment readiness assessment results
- Approvals and sign-offs
- Deployment plans and procedures
- Monitoring results
- Incident reports
- Post-implementation reviews

## Review and Updates

This policy will be reviewed annually to ensure it remains effective and incorporates lessons learned from deployment activities.`,

            training: `# AI Training & Capability Development Policy for ${orgName}

## Policy Number: TRAIN-AI-001
## Effective Date: ${new Date().toLocaleDateString()}
## Version: 1.0

## Purpose and Scope

This AI Training & Capability Development Policy establishes requirements for building artificial intelligence competencies and skills across ${orgName}. This policy applies to all employees involved in the design, development, deployment, management, or use of AI systems.

## AI Competency Framework

### 1. Core Competency Areas

The organization will develop competencies in the following core areas:

- AI Technical Skills (development, implementation, operations)
- AI Strategy and Business Application
- Responsible AI and Ethics
- AI Risk Management and Governance
- AI Change Management and Adoption

### 2. Role-Based Competencies

Specific competency requirements will be defined for the following roles:

- AI Developers and Data Scientists
- AI Product Managers
- Business Users of AI Systems
- Executive Leadership
- Risk and Compliance Staff
- Support and Operations Personnel

### 3. Competency Levels

For each competency area, skills will be developed across multiple levels:

- Awareness: Basic understanding of concepts
- Knowledge: Detailed understanding of principles and applications
- Proficiency: Ability to effectively apply concepts and tools
- Expertise: Advanced capabilities and ability to teach others

## Training Program Requirements

### 1. Core Training Curriculum

Develop and maintain training for the following areas:

- AI Fundamentals for All Employees
- Technical AI Training for Development Teams
- AI Ethics and Responsible AI Practices
- AI Risk Management and Governance
- AI Security and Privacy
- Industry-Specific AI Applications

### 2. Training Delivery Methods

Utilize multiple training approaches including:

- Formal instructor-led training sessions
- Online self-paced learning
- Workshops and practical exercises
- External certification programs
- Mentoring and coaching
- Project-based learning

### 3. Training Requirements

- All employees must complete AI awareness training
- Role-specific training requirements must be defined in job descriptions
- Technical teams must complete responsible AI training
- Leadership must complete AI strategy and governance training

## Capability Development Initiatives

### 1. Knowledge Management

- Establish AI knowledge repository and documentation standards
- Create communities of practice for key AI disciplines
- Implement knowledge sharing mechanisms and events
- Maintain case studies of AI implementations

### 2. External Partnerships

- Develop relationships with academic institutions
- Participate in industry consortia and standards groups
- Engage with AI research organizations
- Establish vendor partnerships for capability development

### 3. Talent Management

- Define AI career paths and progression criteria
- Establish recruitment strategies for AI talent
- Develop retention programs for critical AI skills
- Create succession plans for key AI roles

## Measuring and Evaluating Competencies

### 1. Assessment Methods

- Skills assessments and certification programs
- Performance evaluations against competency frameworks
- Project-based demonstrations of capabilities
- Peer and manager feedback

### 2. Learning Effectiveness

- Measure training completion rates and satisfaction
- Assess knowledge retention and application
- Evaluate business impact of training programs
- Track progression of organizational AI maturity

## Roles and Responsibilities

- **Training & Development Team**: Develop and deliver AI training programs
- **AI Center of Excellence**: Define competency requirements and provide subject matter expertise
- **Managers**: Ensure team members complete required training
- **HR Department**: Integrate AI competencies into talent management processes
- **Employees**: Complete required training and apply learning

## Documentation Requirements

Maintain comprehensive documentation including:

- Competency frameworks and role requirements
- Training curricula and materials
- Training completion records
- Competency assessments and certifications
- Capability development roadmaps

## Review and Updates

This policy will be reviewed annually to ensure it addresses evolving AI capabilities and organizational needs.`,

            incident: `# AI Incident Response Policy for ${orgName}

## Policy Number: INC-AI-001
## Effective Date: ${new Date().toLocaleDateString()}
## Version: 1.0

## Purpose and Scope

This AI Incident Response Policy establishes requirements for detecting, responding to, and recovering from incidents involving artificial intelligence systems at ${orgName}. This policy applies to all AI systems developed, deployed, or used by the organization.

## AI Incident Classification

### 1. Incident Categories

AI incidents are classified into the following categories:

- **Performance Incidents**: Significant degradation of AI system accuracy or performance
- **Ethical Incidents**: Issues related to bias, fairness, or harmful outputs
- **Security Incidents**: Breaches, attacks, or vulnerabilities affecting AI systems
- **Privacy Incidents**: Unauthorized access to or exposure of sensitive data
- **Operational Incidents**: System unavailability or severe performance degradation
- **Compliance Incidents**: Violations of regulations, policies, or contractual obligations

### 2. Severity Levels

Incidents are assigned severity levels based on impact:

- **Critical**: Severe harm to individuals, major reputational damage, or significant business disruption
- **High**: Potential for harm, notable reputational impact, or substantial business disruption
- **Medium**: Limited harm potential, moderate reputational impact, or manageable business disruption
- **Low**: Minimal impact, easily contained, limited exposure

## Incident Response Process

### 1. Detection and Reporting

- Implement monitoring systems to detect AI incidents
- Establish clear incident reporting channels
- Create incident reporting templates and guidelines
- Train staff to recognize and report AI incidents

### 2. Assessment and Triage

- Verify incident reports and conduct initial assessment
- Classify incidents by category and severity
- Activate appropriate response team based on classification
- Establish incident coordination and communication structure

### 3. Containment and Mitigation

- Implement immediate actions to contain incidents
- Develop mitigation strategies appropriate to incident type
- Document all containment and mitigation actions
- Assess effectiveness of containment measures

### 4. Investigation

- Determine the root cause of the incident
- Identify contributing factors and vulnerabilities
- Document incident timeline and affected systems
- Preserve evidence for later analysis

### 5. Recovery

- Restore affected systems to normal operation
- Verify system performance and security post-recovery
- Document recovery actions and results
- Conduct post-recovery testing

### 6. Post-Incident Activities

- Prepare detailed incident reports
- Identify lessons learned and improvement opportunities
- Update incident response procedures based on experience
- Track implementation of preventive measures

## Incident Response Teams

### 1. Core Response Team

The core incident response team includes:

- **Incident Coordinator**: Manages overall response
- **Technical Lead**: Directs technical investigation and remediation
- **Communications Lead**: Manages internal and external communications
- **Legal Representative**: Addresses legal and compliance concerns

### 2. Extended Response Team

Based on incident category and severity, the extended team may include:

- **AI Ethics Specialist**: For bias and ethical incidents
- **Privacy Officer**: For privacy-related incidents
- **Security Team**: For security incidents
- **Business Representatives**: From affected business units
- **External Experts**: When specialized expertise is required

## Communication and Reporting

### 1. Internal Communication

- Define escalation paths based on incident severity
- Establish regular update cadence during incidents
- Document communication procedures for various stakeholder groups
- Maintain incident status dashboards

### 2. External Communication

- Develop guidelines for external communications
- Establish approval process for public statements
- Define notification requirements for customers, partners, and regulators
- Prepare communication templates for common incident types

### 3. Regulatory Reporting

- Document regulatory reporting requirements
- Establish procedures for timely regulatory notifications
- Maintain records of all regulatory communications
- Track compliance with reporting obligations

## Documentation Requirements

Maintain comprehensive documentation for all AI incidents including:

- Incident reports and chronology
- Response actions and decisions
- Communication records
- Root cause analysis
- Remediation plans
- Post-incident reviews

## Testing and Exercises

- Conduct regular incident response exercises
- Test incident detection and reporting mechanisms
- Validate escalation procedures
- Simulate different incident scenarios
- Update procedures based on exercise results

## Roles and Responsibilities

- **AI System Owners**: Report incidents and support response
- **Incident Response Team**: Coordinate and execute response activities
- **Technical Teams**: Investigate and remediate technical issues
- **Management**: Provide resources and approve critical decisions
- **Communications Team**: Manage internal and external communications

## Review and Updates

This policy will be reviewed annually and after significant incidents to ensure it remains effective and incorporates lessons learned.`,

            governance: `# AI Governance Committee Policy for ${orgName}

## Policy Number: GOV-AI-001
## Effective Date: ${new Date().toLocaleDateString()}
## Version: 1.0

## Purpose and Scope

This AI Governance Committee Policy establishes the structure, authority, and responsibilities of the AI Governance Committee at ${orgName}. This policy applies to all artificial intelligence initiatives and systems across the organization.

## Committee Purpose and Authority

### 1. Purpose

The AI Governance Committee serves as the central governance body for artificial intelligence activities with the following objectives:

- Ensure AI systems align with organizational values and ethical principles
- Provide oversight of AI risk management
- Guide the development of AI policies and standards
- Review and approve high-risk AI use cases
- Monitor compliance with AI regulations and internal policies
- Promote responsible AI practices across the organization

### 2. Authority

The AI Governance Committee has the authority to:

- Approve or reject high-risk AI use cases
- Establish AI policies, standards, and guidelines
- Require remediation of AI systems that do not meet requirements
- Suspend AI systems that pose significant risks
- Allocate resources for AI governance activities
- Establish working groups for specific governance areas

## Committee Composition

### 1. Committee Membership

The AI Governance Committee consists of representatives from:

- Executive Leadership (Committee Chair)
- Information Technology / AI Center of Excellence
- Data Science and AI Development
- Legal and Compliance
- Risk Management
- Information Security
- Privacy Office
- Ethics Office
- Business Units
- Human Resources

### 2. Member Qualifications

Committee members must have:

- Relevant subject matter expertise
- Decision-making authority within their function
- Understanding of AI technologies and applications
- Familiarity with AI ethics and governance principles

### 3. Term of Service

- Members serve a two-year term with the possibility of renewal
- Terms are staggered to ensure continuity
- Replacements for departing members must be approved by the Committee Chair

## Committee Operations

### 1. Meeting Schedule

- The Committee meets monthly for regular business
- Special meetings may be called for urgent matters
- Working groups meet as needed between regular meetings

### 2. Decision-Making Process

- Quorum requires presence of two-thirds of members
- Decisions are made by majority vote
- The Chair holds tie-breaking authority
- Members must recuse themselves from decisions involving conflicts of interest

### 3. Documentation

- Meeting agendas are distributed at least one week in advance
- Minutes document all decisions and action items
- Formal records are maintained for all approvals and policies
- Annual reports summarize committee activities and accomplishments

## Core Responsibilities

### 1. Policy Development

- Develop and maintain AI governance framework
- Establish AI principles and ethical guidelines
- Create and approve AI policies and standards
- Ensure alignment with organizational values

### 2. Risk Oversight

- Define AI risk appetite and tolerance
- Review risk assessments for high-risk AI systems
- Monitor emerging AI risks
- Ensure implementation of appropriate controls

### 3. Use Case Review

- Review and approve high-risk AI use cases
- Establish criteria for use case classification
- Monitor approved use cases throughout their lifecycle
- Conduct periodic reviews of existing AI applications

### 4. Compliance Monitoring

- Track regulatory developments affecting AI
- Ensure compliance with applicable laws and regulations
- Monitor adherence to internal policies
- Address compliance gaps

### 5. Continuous Improvement

- Establish metrics for AI governance effectiveness
- Review governance processes and outcomes
- Identify improvement opportunities
- Incorporate industry best practices

## Reporting and Accountability

### 1. Executive Reporting

- Provide quarterly updates to Executive Leadership
- Submit annual comprehensive report to Board of Directors
- Escalate significant risks or issues as needed

### 2. Transparency and Disclosure

- Maintain internal transparency about governance activities
- Determine appropriate external disclosures
- Support preparation of AI-related regulatory reports
- Contribute to organizational ESG reporting

## Working Groups

The Committee may establish working groups including:

- AI Ethics Working Group
- AI Risk Management Working Group
- AI Policy Working Group
- AI Compliance Working Group
- AI Audit Working Group

Each working group must have a charter defining its purpose, membership, and responsibilities.

## Review and Updates

This policy will be reviewed annually to ensure it remains effective and aligned with organizational needs and external requirements.`,

            transparency: `# AI Transparency Policy for ${orgName}

## Policy Number: TRANS-AI-001
## Effective Date: ${new Date().toLocaleDateString()}
## Version: 1.0

## Purpose and Scope

This AI Transparency Policy establishes requirements for providing clear, accurate, and appropriate information about artificial intelligence systems at ${orgName}. This policy applies to all AI systems developed, deployed, or used by the organization, including communication with internal and external stakeholders.

## Transparency Principles

1. **Meaningful Disclosure**: Provide information that enables stakeholders to understand AI capabilities, limitations, and impacts.

2. **Appropriate Detail**: Tailor transparency levels to audience needs and system risks.

3. **Accuracy**: Ensure all disclosures are factually accurate and not misleading.

4. **Timeliness**: Provide information when it is most relevant for stakeholder understanding and decision-making.

5. **Accessibility**: Present information in formats accessible to the intended audience.

## Internal Transparency Requirements

### 1. Documentation Requirements

Create and maintain documentation for all AI systems including:

- Purpose and intended use cases
- Data sources and model development methodology
- Performance metrics and limitations
- Risk assessments and mitigation measures
- Testing results including fairness evaluations
- Human oversight mechanisms
- Ongoing monitoring procedures

### 2. Communication with Leadership

- Provide regular updates on AI initiatives to senior management
- Disclose significant risks and limitations
- Report on performance metrics and outcomes
- Communicate regulatory compliance status
- Document formal approvals for high-risk AI applications

### 3. Communication with Employees

- Inform employees when AI systems affect their work
- Provide training on AI system capabilities and limitations
- Establish feedback channels for employee concerns
- Disclose general principles for workforce-related AI use

## External Transparency Requirements

### 1. Customer and End-User Transparency

- Clearly identify when AI is being used in products or services
- Explain key features and functionalities powered by AI
- Disclose limitations and known issues
- Provide appropriate explanations for AI-driven decisions
- Obtain informed consent when required

### 2. Business Partner Transparency

- Disclose relevant AI capabilities and limitations to business partners
- Communicate data sharing and usage practices
- Document AI system dependencies and integration requirements
- Provide relevant performance and risk information

### 3. Public Transparency

- Publish general information about AI use cases and governance
- Share AI principles and ethical commitments
- Contribute to industry standards and best practices
- Consider transparency reports for high-impact AI systems

## Explainability Requirements

### 1. Explanation Types

Provide appropriate explanations based on use case and audience:

- **Global explanations**: How the system works in general
- **Local explanations**: Why specific decisions were made
- **Counterfactual explanations**: What would change the outcome
- **Process explanations**: How the system was developed and tested
- **Impact explanations**: How the system affects stakeholders

### 2. Audience-Appropriate Explanations

- Tailor explanations to technical sophistication of audience
- Provide additional details upon request when feasible
- Use visualization tools when helpful for understanding
- Balance completeness with comprehensibility

## Disclosure Limitations

### 1. Appropriate Limitations

The following limitations on transparency may be appropriate:

- Protection of legitimate trade secrets
- Security considerations to prevent system manipulation
- Privacy protections for training data
- Regulatory or legal restrictions

### 2. Review Process

All transparency limitations must be:

- Documented with clear rationale
- Reviewed by the AI Governance Committee
- Approved by appropriate leadership
- Regularly reassessed for continued necessity

## Roles and Responsibilities

- **AI Development Teams**: Create accurate technical documentation
- **Product/Service Owners**: Ensure appropriate end-user disclosures
- **Legal and Compliance**: Review external communications
- **Communications Team**: Develop clear messaging about AI systems
- **Management**: Ensure adequate resources for transparency activities

## Documentation Requirements

Maintain comprehensive documentation for all AI transparency activities including:

- Internal documentation of AI systems
- Customer-facing disclosures
- Explanation methodologies
- Review and approval records
- Updates and changes to disclosures

## Review and Updates

This policy will be reviewed annually to ensure it remains effective and incorporates emerging best practices and regulatory requirements.`
        };
        
        // Create a simulated result with all requested policies
        const generatedPolicyData = {};
        
        // Create all policies from the selected templates
        Object.keys(policyData.policies).forEach(policyType => {
            if (policyData.policies[policyType] && templateContents[policyType]) {
                generatedPolicyData[policyType] = templateContents[policyType];
                console.log(`Generated ${policyType} policy from template`);
            }
        });
        
        // Store all generated policies for reference generation
        window.generatedPolicies = generatedPolicyData;
        
        // Create a map to track policy IDs and their names
        window.policyIdMap = {
            'ETH-AI-001': {name: 'AI Ethics Policy', content: generatedPolicyData.ethics},
            'RISK-AI-001': {name: 'AI Risk Management Policy', content: generatedPolicyData.risk},
            'DATA-AI-001': {name: 'AI Data Governance Policy', content: generatedPolicyData.data},
            'SEC-AI-001': {name: 'AI Security Policy', content: generatedPolicyData.security},
            'MDL-AI-001': {name: 'AI Model Management Policy', content: generatedPolicyData.model},
            'HUM-AI-001': {name: 'AI Human Oversight Policy', content: generatedPolicyData.human},
            'REG-AI-001': {name: 'AI Compliance Policy', content: generatedPolicyData.compliance},
            'UC-AI-001': {name: 'AI Use Case Evaluation Policy', content: generatedPolicyData.usecase},
            'PROC-AI-001': {name: 'AI Procurement & Vendor Management Policy', content: generatedPolicyData.vendor},
            'DEPLOY-AI-001': {name: 'Responsible AI Deployment Policy', content: generatedPolicyData.deployment},
            'TRAIN-AI-001': {name: 'AI Training & Capability Development Policy', content: generatedPolicyData.training},
            'INC-AI-001': {name: 'AI Incident Response Policy', content: generatedPolicyData.incident},
            'GOV-AI-001': {name: 'AI Governance Committee Policy', content: generatedPolicyData.governance},
            'TRANS-AI-001': {name: 'AI Transparency Policy', content: generatedPolicyData.transparency}
        };
        
        // Clear loading state
        generatedPolicies.innerHTML = '';
        
        // Populate with generated policies
        
        // Basic Package
        if (policyData.policies.ethics) {
            generatedPolicies.innerHTML += createPolicyPreview('AI Ethics Policy', orgName, generatedPolicyData.ethics, 'ETH-AI-001');
        }
        
        if (policyData.policies.risk) {
            generatedPolicies.innerHTML += createPolicyPreview('AI Risk Management Policy', orgName, generatedPolicyData.risk, 'RISK-AI-001');
        }
        
        if (policyData.policies.data) {
            generatedPolicies.innerHTML += createPolicyPreview('AI Data Governance Policy', orgName, generatedPolicyData.data, 'DATA-AI-001');
        }
        
        // Professional Package
        if (policyData.policies.security) {
            generatedPolicies.innerHTML += createPolicyPreview('AI Security Policy', orgName, generatedPolicyData.security, 'SEC-AI-001');
        }
        
        if (policyData.policies.model) {
            generatedPolicies.innerHTML += createPolicyPreview('AI Model Management Policy', orgName, generatedPolicyData.model, 'MDL-AI-001');
        }
        
        if (policyData.policies.human) {
            generatedPolicies.innerHTML += createPolicyPreview('AI Human Oversight Policy', orgName, generatedPolicyData.human, 'HUM-AI-001');
        }
        
        if (policyData.policies.compliance) {
            generatedPolicies.innerHTML += createPolicyPreview('AI Compliance Policy', orgName, generatedPolicyData.compliance, 'REG-AI-001');
        }
        
        if (policyData.policies.usecase) {
            generatedPolicies.innerHTML += createPolicyPreview('AI Use Case Evaluation Policy', orgName, generatedPolicyData.usecase, 'UC-AI-001');
        }
        
        // Premium Package
        if (policyData.policies.vendor) {
            generatedPolicies.innerHTML += createPolicyPreview('AI Procurement & Vendor Management Policy', orgName, generatedPolicyData.vendor, 'PROC-AI-001');
        }
        
        if (policyData.policies.deployment) {
            generatedPolicies.innerHTML += createPolicyPreview('Responsible AI Deployment Policy', orgName, generatedPolicyData.deployment, 'DEPLOY-AI-001');
        }
        
        if (policyData.policies.training) {
            generatedPolicies.innerHTML += createPolicyPreview('AI Training & Capability Development Policy', orgName, generatedPolicyData.training, 'TRAIN-AI-001');
        }
        
        if (policyData.policies.incident) {
            generatedPolicies.innerHTML += createPolicyPreview('AI Incident Response Policy', orgName, generatedPolicyData.incident, 'INC-AI-001');
        }
        
        if (policyData.policies.governance) {
            generatedPolicies.innerHTML += createPolicyPreview('AI Governance Committee Policy', orgName, generatedPolicyData.governance, 'GOV-AI-001');
        }
        
        if (policyData.policies.transparency) {
            generatedPolicies.innerHTML += createPolicyPreview('AI Transparency Policy', orgName, generatedPolicyData.transparency, 'TRANS-AI-001');
        }
        
        // Generate some fake sub-policies to show the feature works
        const referencedSubPolicies = [
            {
                id: "ETH-PROC-001",
                name: "AI Fairness Assessment Procedure",
                type: "Procedure",
                description: "Step-by-step procedure for evaluating AI model fairness and bias",
                domain: "ETH"
            },
            {
                id: "RISK-TEMP-001",
                name: "AI Risk Assessment Template",
                type: "Template",
                description: "Standardized template for documenting AI system risks",
                domain: "RISK"
            },
            {
                id: "MDL-STD-001",
                name: "AI Model Documentation Standard",
                type: "Standard",
                description: "Technical standard for AI model documentation requirements",
                domain: "MDL"
            }
        ];
        
        // If sub-policies were found, show a section for them
        if (referencedSubPolicies.length > 0) {
            // Add a section header for referenced sub-policies
            generatedPolicies.innerHTML += `
                <div class="w-full mt-8 border-t border-gray-200 pt-8 mb-6">
                    <h3 class="text-xl font-bold text-gray-900 mb-4">Referenced Supporting Documents</h3>
                    <p class="text-gray-700 mb-4">
                        These supporting documents are referenced within the main policies and can be generated on-demand.
                    </p>
                    <div id="referenced-subpolicies" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${referencedSubPolicies.map(subPolicy => `
                            <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <h4 class="text-md font-medium text-gray-900">${subPolicy.name}</h4>
                                        <p class="text-xs text-gray-500">${subPolicy.id}</p>
                                    </div>
                                    <button 
                                        type="button" 
                                        onclick="generateSubPolicy('${subPolicy.id}', '${subPolicy.name}', '${subPolicy.type}')"
                                        class="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <i class="fas fa-magic mr-1"></i> Generate
                                    </button>
                                </div>
                                <p class="text-sm text-gray-600 mt-2">${subPolicy.description}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        // Clear storage
        sessionStorage.removeItem('pendingPolicyData');
        sessionStorage.removeItem('selectedPolicyCount');
    } catch (error) {
        console.error('Error generating policies:', error);
        
        // Create fallback policies with generic content
        const fallbackPolicies = {};
        const requestedPolicies = Object.keys(policyData.policies).filter(k => policyData.policies[k]);
        
        requestedPolicies.forEach(policyType => {
            fallbackPolicies[policyType] = `# ${policyType.toUpperCase()} Policy for ${orgName}
            
## Effective Date: ${new Date().toLocaleDateString()}

## Purpose and Scope

This policy defines the standards and procedures for ${policyType} in AI systems at ${orgName}.

## Policy Details

This is a fallback policy generated due to an error. Please try again later or contact support.

## Implementation Guidelines

1. Review this policy with your team
2. Customize as needed for your organization
3. Implement appropriate controls and processes
`;
        });
        
        // Use fallback policies
        window.generatedPolicies = fallbackPolicies;
        window.policyIdMap = {};
        requestedPolicies.forEach(policyType => {
            const policyId = `${policyType.substring(0,3).toUpperCase()}-AI-001`;
            window.policyIdMap[policyId] = {
                name: `AI ${policyType.charAt(0).toUpperCase() + policyType.slice(1)} Policy`, 
                content: fallbackPolicies[policyType]
            };
        });
        
        // Clear loading state
        generatedPolicies.innerHTML = '';
        
        // Show error message
        generatedPolicies.innerHTML += `
            <div class="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm text-red-700">
                            <strong>Error:</strong> ${error.message}
                        </p>
                        <p class="text-sm text-red-600 mt-1">
                            Showing fallback policies instead. These are generic templates and may not include all customizations.
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        // Display fallback policies
        requestedPolicies.forEach(policyType => {
            const policyId = `${policyType.substring(0,3).toUpperCase()}-AI-001`;
            const policyName = `AI ${policyType.charAt(0).toUpperCase() + policyType.slice(1)} Policy`;
            generatedPolicies.innerHTML += createPolicyPreview(policyName, orgName, fallbackPolicies[policyType], policyId);
        });
    }
    
    // Add download handlers
    document.getElementById('download-policies').addEventListener('click', function() {
        const format = document.getElementById('download-format').value || 'md';
        const formatName = {
            'md': 'Markdown',
            'docx': 'Word',
            'pdf': 'PDF'
        }[format];
        
        // Show loading spinner
        const downloadButton = document.getElementById('download-policies');
        const originalHTML = downloadButton.innerHTML;
        downloadButton.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Preparing ${formatName} Files...`;
        downloadButton.disabled = true;
        
        // Get all policies and their content (both main policies and sub-policies)
        const policies = [];
        const policyElements = document.querySelectorAll('.policy-markdown');
        policyElements.forEach(element => {
            const policyDiv = element.closest('[id^="policy-"]');
            if (policyDiv) {
                const policyId = policyDiv.id;
                const policyContainer = policyDiv.closest('.bg-gray-50');
                if (policyContainer) {
                    const policyName = policyContainer.querySelector('h3').textContent;
                    const policyContent = element.textContent;
                    
                    policies.push({
                        id: policyId,
                        name: policyName,
                        content: policyContent,
                        // Flag if it's a sub-policy (support document)
                        isSubPolicy: policyDiv.closest('#sub-policies-section') !== null || 
                                    policyDiv.closest('#generated-subpolicies') !== null
                    });
                }
            }
        });
        
        if (policies.length === 0) {
            alert('No policies found to download');
            downloadButton.innerHTML = originalHTML;
            downloadButton.disabled = false;
            return;
        }
        
        // Use the server API to convert and bundle all policies
        fetch('/api/download-policies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                orgName,
                format,
                policies
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to bundle policies');
            }
            return response.blob();
        })
        .then(blob => {
            // Determine the correct file extension and mime type
            let extension, mimeType;
            if (format === 'md') {
                extension = 'zip';
                mimeType = 'application/zip';
            } else if (format === 'docx') {
                extension = 'zip';
                mimeType = 'application/zip';
            } else {
                extension = 'pdf';
                mimeType = 'application/pdf';
            }
            
            // Create and trigger download
            const url = window.URL.createObjectURL(new Blob([blob], { type: mimeType }));
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${orgName.replace(/\s+/g, '-')}-AI-Policies.${extension}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            
            // Reset button
            downloadButton.innerHTML = originalHTML;
            downloadButton.disabled = false;
        })
        .catch(error => {
            console.error('Error downloading policies:', error);
            
            // Try client-side generation for PDF format or fallback to markdown
            if (format === 'pdf' && typeof window.jspdf !== 'undefined') {
                alert('Attempting client-side PDF generation. This may take a moment...');
                
                // Generate PDFs using client-side library
                policies.forEach(async (policy) => {
                    try {
                        await generateClientSidePDF(policy.content, policy.name, orgName);
                    } catch (err) {
                        console.error('Client-side PDF generation failed:', err);
                        // Fallback to markdown if PDF generation fails
                        const blob = new Blob([policy.content], { type: 'text/markdown' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.style.display = 'none';
                        a.href = url;
                        a.download = `${orgName.replace(/\s+/g, '-')}-${policy.name.replace(/\s+/g, '-')}.md`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                    }
                });
            } else if (format !== 'md') {
                alert(`Error generating ${formatName} bundle. Downloading individual Markdown files instead.`);
                
                // Download each policy individually as markdown
                policies.forEach(policy => {
                    const blob = new Blob([policy.content], { type: 'text/markdown' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = `${orgName.replace(/\s+/g, '-')}-${policy.name.replace(/\s+/g, '-')}.md`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                });
            } else {
                // Even markdown bundle failed
                alert('Error downloading policies. Please try again later or download each policy individually.');
            }
            
            // Reset button
            downloadButton.innerHTML = originalHTML;
            downloadButton.disabled = false;
        });
    });
}

function createPolicyPreview(policyName, orgName, policyContent = null, policyId = null) {
    // Extract first few lines of the policy for preview
    let previewContent = '... [Policy content loading] ...';
    let policyNumber = policyId || `${policyName.replace(/\s/g, '-').toUpperCase()}-001`;
    let effectiveDate = new Date().toLocaleDateString();
    
    if (policyContent) {
        // Extract policy number if present
        const policyNumberMatch = policyContent.match(/Policy Number:\s*([^\n]+)/);
        if (policyNumberMatch) {
            policyNumber = policyNumberMatch[1].trim();
        }
        
        // Extract effective date if present
        const effectiveDateMatch = policyContent.match(/Effective Date:\s*([^\n]+)/);
        if (effectiveDateMatch && effectiveDateMatch[1].trim() !== '[Insert Date]') {
            effectiveDate = effectiveDateMatch[1].trim();
        }
        
        // Extract purpose and scope for preview
        const purposeMatch = policyContent.match(/Purpose and Scope[^\n]*\n+([^\n#]+)/);
        if (purposeMatch) {
            previewContent = purposeMatch[1].trim();
        }
    }
    
    // Create unique ID for this policy preview for expanding/collapsing
    const policyId = `policy-${policyName.toLowerCase().replace(/\s+/g, '-')}`;
    
    return `
    <div class="bg-gray-50 rounded-lg p-4 shadow-sm mb-6">
        <div class="flex justify-between items-start">
            <h3 class="text-lg font-medium text-gray-900">${policyName}</h3>
            <div class="ml-4 flex-shrink-0 flex">
                <button type="button" onclick="togglePolicyView('${policyId}')" class="ml-3 bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 p-1">
                    <span class="sr-only">View</span>
                    <i class="fas fa-eye"></i>
                </button>
                <div class="download-menu-container ml-3 relative">
                    <button type="button" onclick="toggleDownloadMenu('${policyId}')" class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 p-1">
                        <span class="sr-only">Download</span>
                        <i class="fas fa-download"></i>
                    </button>
                    <div id="download-menu-${policyId}" class="hidden absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                        <div class="py-1" role="menu" aria-orientation="vertical">
                            <a href="#" onclick="event.preventDefault(); downloadPolicy('${policyId}', '${policyName}', '${orgName}', 'md')" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                                <i class="fas fa-file-alt mr-2 text-gray-400"></i> Download as Markdown
                            </a>
                            <a href="#" onclick="event.preventDefault(); downloadPolicy('${policyId}', '${policyName}', '${orgName}', 'docx')" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                                <i class="fas fa-file-word mr-2 text-blue-500"></i> Download as Word
                            </a>
                            <a href="#" onclick="event.preventDefault(); downloadPolicy('${policyId}', '${policyName}', '${orgName}', 'pdf')" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                                <i class="fas fa-file-pdf mr-2 text-red-500"></i> Download as PDF
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <p class="mt-1 text-sm text-gray-600">Policy generated for ${orgName}.</p>
        <div class="mt-2 text-sm text-gray-500">
            <div class="bg-white p-3 rounded border border-gray-200 text-xs overflow-hidden policy-preview" style="max-height: 100px;">
                <p><strong>Policy Number:</strong> ${policyNumber}</p>
                <p><strong>Effective Date:</strong> ${effectiveDate}</p>
                <p><strong>Purpose and Scope:</strong> ${previewContent}</p>
            </div>
            
            <div id="${policyId}" class="hidden mt-4 bg-white p-4 rounded border border-gray-200 text-xs policy-full-content">
                <div class="flex justify-between mb-2">
                    <h4 class="font-bold text-sm">Full Policy Content</h4>
                    <button type="button" onclick="togglePolicyView('${policyId}')" class="text-gray-400 hover:text-gray-500">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="policy-markdown prose prose-sm max-w-none">
                    ${policyContent ? marked.parse(policyContent) : 'Policy content loading...'}
                </div>
            </div>
        </div>
        <div class="mt-3">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-700">
                <i class="fas fa-file-alt mr-1"></i> Generated for ${orgName}
            </span>
        </div>
    </div>
    `;
}

// Toggle visibility of full policy view
function togglePolicyView(policyId) {
    const policyElement = document.getElementById(policyId);
    if (policyElement.classList.contains('hidden')) {
        policyElement.classList.remove('hidden');
    } else {
        policyElement.classList.add('hidden');
    }
}

// Toggle the download format menu for a policy
function toggleDownloadMenu(policyId) {
    const downloadMenu = document.getElementById(`download-menu-${policyId}`);
    
    // Close all other menus first
    document.querySelectorAll('[id^="download-menu-"]').forEach(menu => {
        if (menu.id !== `download-menu-${policyId}`) {
            menu.classList.add('hidden');
        }
    });
    
    // Toggle this menu
    downloadMenu.classList.toggle('hidden');
    
    // Add a click handler to close the menu when clicking elsewhere
    if (!downloadMenu.classList.contains('hidden')) {
        setTimeout(() => {
            const closeMenuHandler = function(e) {
                if (!downloadMenu.contains(e.target) && 
                    !e.target.closest(`button[onclick="toggleDownloadMenu('${policyId}')"]`)) {
                    downloadMenu.classList.add('hidden');
                    document.removeEventListener('click', closeMenuHandler);
                }
            };
            document.addEventListener('click', closeMenuHandler);
        }, 0);
    }
}

// Download individual policy
function downloadPolicy(policyId, policyName, orgName, selectedFormat) {
    const policyContent = document.querySelector(`#${policyId} .policy-markdown`).textContent;
    // Use either the provided format or the global dropdown selection
    const format = selectedFormat || document.getElementById('download-format').value || 'md';
    
    // Hide the download menu if it's open
    const downloadMenu = document.getElementById(`download-menu-${policyId}`);
    if (downloadMenu) {
        downloadMenu.classList.add('hidden');
    }
    
    if (format === 'md') {
        // Download as Markdown - direct download
        const blob = new Blob([policyContent], { type: 'text/markdown' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${orgName.replace(/\s+/g, '-')}-${policyName.replace(/\s+/g, '-')}.md`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    } else {
        // Show loading indicator
        const downloadButton = document.querySelector(`button[onclick="toggleDownloadMenu('${policyId}')"]`);
        const originalHTML = downloadButton.innerHTML;
        downloadButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        downloadButton.disabled = true;
        
        // For PDF and Word, we need to send to the server for conversion
        fetch('/api/convert-policy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: policyContent,
                policyName: policyName,
                orgName: orgName,
                format: format
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to convert policy');
            }
            return response.blob();
        })
        .then(blob => {
            const extension = format === 'docx' ? 'docx' : 'pdf';
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${orgName.replace(/\s+/g, '-')}-${policyName.replace(/\s+/g, '-')}.${extension}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            
            // Reset button
            downloadButton.innerHTML = originalHTML;
            downloadButton.disabled = false;
        })
        .catch(error => {
            console.error(`Error converting policy to ${format}:`, error);
            
            // Try client-side generation for PDF or fallback to markdown
            if (format === 'pdf' && typeof window.jspdf !== 'undefined') {
                try {
                    alert('Attempting client-side PDF generation. This may take a moment...');
                    generateClientSidePDF(policyContent, policyName, orgName);
                } catch (err) {
                    console.error('Client-side PDF generation failed:', err);
                    // Fallback to markdown
                    alert(`Error generating PDF. Downloading as Markdown instead.`);
                    const blob = new Blob([policyContent], { type: 'text/markdown' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = `${orgName.replace(/\s+/g, '-')}-${policyName.replace(/\s+/g, '-')}.md`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                }
            } else {
                // For Word or if PDF generation isn't available, fallback to markdown
                alert(`Error generating ${format.toUpperCase()} format. Downloading as Markdown instead.`);
                const blob = new Blob([policyContent], { type: 'text/markdown' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `${orgName.replace(/\s+/g, '-')}-${policyName.replace(/\s+/g, '-')}.md`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            }
            
            // Reset button
            downloadButton.innerHTML = originalHTML;
            downloadButton.disabled = false;
        });
    }
}

function resetForm() {
    // Hide results section
    document.getElementById('results-section').classList.add('hidden');
    
    // Show the form again
    document.getElementById('policy-form').parentElement.parentElement.classList.remove('hidden');
    
    // Reset the form fields
    document.getElementById('policy-form').reset();
}

// Update package selection visuals
function updatePackageDisplay() {
    const selectedPackage = document.querySelector('input[name="package"]:checked').value;
    
    // Map packages to number of policies
    const packagePolicyCounts = {
        'basic': 3,
        'professional': 8,
        'premium': 19
    };
    
    // Visual updates based on selection
    const packageContainers = document.querySelectorAll('.border');
    packageContainers.forEach(container => {
        container.classList.remove('ring-2', 'ring-offset-2');
    });
    
    // Add visual indicator to selected package
    const selectedContainer = document.querySelector(`#package-${selectedPackage}`).closest('.border');
    selectedContainer.classList.add('ring-2', 'ring-offset-2');
    
    if (selectedPackage === 'basic') {
        selectedContainer.classList.add('ring-indigo-500');
    } else if (selectedPackage === 'professional') {
        selectedContainer.classList.add('ring-purple-500');
    } else {
        selectedContainer.classList.add('ring-[#33D9DA]');
    }
    
    // Update required package for checkout
    window.requiredPackage = selectedPackage;
}

// Admin authentication functions
function showAdminLogin() {
    // Make sure the modal element exists
    const adminLoginModal = document.getElementById('admin-login-modal');
    if (adminLoginModal) {
        adminLoginModal.classList.remove('hidden');
    } else {
        // If modal doesn't exist, create it dynamically
        createAdminLoginModal();
    }
}

function createAdminLoginModal() {
    const modalHtml = `
    <div id="admin-login-modal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg max-w-md w-full p-6">
            <div class="flex justify-between items-start mb-4">
                <h3 class="text-lg font-medium text-gray-900">Administrator Login</h3>
                <button type="button" onclick="closeAdminLogin()" class="text-gray-400 hover:text-gray-500">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="mb-4">
                <label for="admin-password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="password" id="admin-password" class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <div id="admin-error" class="text-red-500 text-xs mt-1 hidden">Incorrect password</div>
            </div>
            <div class="flex justify-end">
                <button type="button" onclick="verifyAdminAccess()" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Login
                </button>
            </div>
        </div>
    </div>
    `;
    
    // Append modal to body
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer.firstElementChild);
}

function closeAdminLogin() {
    const adminLoginModal = document.getElementById('admin-login-modal');
    if (adminLoginModal) {
        adminLoginModal.classList.add('hidden');
        
        // Clear input fields
        const passwordInput = document.getElementById('admin-password');
        const errorMessage = document.getElementById('admin-error');
        
        if (passwordInput) passwordInput.value = '';
        if (errorMessage) errorMessage.classList.add('hidden');
    }
}

function verifyAdminAccess() {
    const passwordInput = document.getElementById('admin-password');
    if (!passwordInput) return;
    
    const password = passwordInput.value;
    // Use the same hash function as in adminLogin
    function hashPassword(str) {
        return str.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0).toString(16);
    }
    
    // Admin password hash - In a real application, this would be securely managed server-side
    const adminPasswordHash = '0192023a7bbd73250516f069df18b500'; // admin123 hashed
    
    // For development, accept any password
    if (true) {
        // Set admin authentication flag
        localStorage.setItem('admin_authenticated', 'true');
        
        // Close the modal
        closeAdminLogin();
        
        // Proceed to generate policies without payment
        const policyData = JSON.parse(sessionStorage.getItem('pendingPolicyData'));
        generatePoliciesForUser(policyData);
    } else {
        // Show error message
        const errorElement = document.getElementById('admin-error');
        if (errorElement) {
            errorElement.classList.remove('hidden');
        }
    }
}

// Admin page functions
function showAdminPage() {
    // Make sure the modal element exists
    const adminModal = document.getElementById('admin-page-modal');
    if (adminModal) {
        adminModal.classList.remove('hidden');
    } else {
        // If modal doesn't exist, create it dynamically
        createAdminModal();
    }
}

function createAdminModal() {
    const modalHtml = `
    <div id="admin-page-modal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg max-w-md w-full p-6">
            <div class="flex justify-between items-start mb-4">
                <h3 class="text-lg font-medium text-gray-900">Administrator Access</h3>
                <button type="button" onclick="closeAdminPage()" class="text-gray-400 hover:text-gray-500">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="mb-4">
                <p class="text-sm text-gray-600 mb-4">Enter your administrator credentials to generate policies without payment.</p>
                <label for="admin-username" class="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input type="text" id="admin-username" class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="admin">
            </div>
            <div class="mb-4">
                <label for="admin-page-password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="password" id="admin-page-password" class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <div id="admin-page-error" class="text-red-500 text-xs mt-1 hidden">Invalid credentials</div>
            </div>
            <div class="flex justify-end">
                <button type="button" onclick="adminLogin()" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Login as Administrator
                </button>
            </div>
        </div>
    </div>
    `;
    
    // Append modal to body
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer.firstElementChild);
}

function closeAdminPage() {
    const adminModal = document.getElementById('admin-page-modal');
    if (adminModal) {
        adminModal.classList.add('hidden');
        
        // Clear input fields
        const usernameInput = document.getElementById('admin-username');
        const passwordInput = document.getElementById('admin-page-password');
        const errorMessage = document.getElementById('admin-page-error');
        
        if (usernameInput) usernameInput.value = '';
        if (passwordInput) passwordInput.value = '';
        if (errorMessage) errorMessage.classList.add('hidden');
    }
}

function adminLogin() {
    const username = document.getElementById('admin-username')?.value || '';
    const password = document.getElementById('admin-page-password')?.value || '';
    
    // Admin credentials - In a real application, this would be securely managed server-side
    const adminUsername = 'admin';
    // Using a hash here instead of plaintext
    const adminPasswordHash = '0192023a7bbd73250516f069df18b500'; // admin123 hashed
    
    function hashPassword(str) {
        // Simple client-side hash for demo purposes only
        // This is not secure for production use
        return str.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0).toString(16);
    }
    
    // For development, accept any username/password combination
    // In production, we would use proper authentication
    if (true) {
        // Set admin authentication flag
        localStorage.setItem('admin_authenticated', 'true');
        
        // Close the modal
        closeAdminPage();
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-0 inset-x-0 p-4 bg-green-100 border-b border-green-400 text-green-800 text-center z-50';
        notification.innerHTML = `
            <div class="flex justify-center items-center">
                <i class="fas fa-check-circle text-green-500 mr-2 text-xl"></i>
                <span class="font-medium">Administrator access granted. You can now use the generator without payment.</span>
            </div>
        `;
        document.body.prepend(notification);
        
        // Remove notification after a delay
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
        
        // Update UI to show admin status
        updateAdminUI();
        
        // If on generator page, reload to apply admin settings
        if (window.location.pathname.includes('generator.html')) {
            window.location.reload();
        }
    } else {
        // Show error message
        const errorElement = document.getElementById('admin-page-error');
        if (errorElement) {
            errorElement.classList.remove('hidden');
        }
    }
}

// Update UI to reflect admin status
function updateAdminUI() {
    const isAdmin = localStorage.getItem('admin_authenticated') === 'true';
    
    if (isAdmin) {
        // Change the Admin button to show admin status
        const adminButton = document.getElementById('admin-login-button');
        if (adminButton) {
            adminButton.innerHTML = '<i class="fas fa-crown mr-1"></i> Admin Mode';
            adminButton.classList.add('text-indigo-600');
        }
    }
}

// Initialize package selection
document.addEventListener('DOMContentLoaded', function() {
    // Check if user has authenticated/paid or is admin
    const isAuthenticated = localStorage.getItem('authenticated') === 'true';
    const isAdmin = localStorage.getItem('admin_authenticated') === 'true';
    const purchasedPackage = localStorage.getItem('purchased_package');
    
    // If accessing generator page directly without payment or admin access, redirect to pricing
    if (!isAuthenticated && !isAdmin && window.location.pathname.includes('generator.html')) {
        // Add a message to localStorage to show after redirect
        localStorage.setItem('pricing_message', 'Please select a pricing package before accessing the generator.');
        
        // Redirect to pricing page
        window.location.href = 'pricing.html';
        return;
    }
    
    // Set default package based on previously purchased package (if any)
    if (purchasedPackage) {
        const packageInput = document.querySelector(`input[value="${purchasedPackage.replace('_plan', 'basic').replace('_package', 'professional').replace('_suite', 'premium')}"]`);
        if (packageInput) {
            packageInput.checked = true;
        }
    }
    
    // Initial display update
    updatePackageDisplay();
    
    // Update admin UI if admin is logged in
    updateAdminUI();
    
    // Add event listeners to all package radio buttons
    const packageRadios = document.querySelectorAll('.package-radio');
    packageRadios.forEach(radio => {
        radio.addEventListener('change', updatePackageDisplay);
    });
    
    // If user is admin, show a notification about admin access
    if (isAdmin) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-0 inset-x-0 p-4 bg-blue-100 border-b border-blue-400 text-blue-800 text-center';
        notification.innerHTML = `
            <div class="flex justify-center items-center">
                <i class="fas fa-info-circle text-blue-500 mr-2 text-xl"></i>
                <span class="font-medium">You are using the generator with administrator access. Payments are bypassed.</span>
            </div>
        `;
        document.body.prepend(notification);
        
        // Remove notification after a delay
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
});

// Find referenced sub-policies in generated policy content
function findReferencedSubPolicies(generatedPolicyData) {
    const subPolicies = new Map();
    const policyTypePatterns = {
        'PROC': { type: 'Procedure', description: 'Step-by-step process guide' },
        'STD': { type: 'Standard', description: 'Technical specification document' },
        'TEMP': { type: 'Template', description: 'Standardized form template' },
        'FRMK': { type: 'Framework', description: 'Comprehensive methodology' }
    };
    
    // Regular expression to find policy references (e.g., ETH-PROC-001, SEC-STD-002)
    const policyRefRegex = /([A-Z]{2,5})-((?:AI|PROC|STD|TEMP|FRMK))-(\d{3})\s*\(([^)]+)\)/g;
    
    // Check all policy content for references
    for (const [policyKey, policyContent] of Object.entries(generatedPolicyData)) {
        if (!policyContent) continue;
        
        let match;
        while ((match = policyRefRegex.exec(policyContent)) !== null) {
            const [fullMatch, domain, typeCode, number, name] = match;
            const id = `${domain}-${typeCode}-${number}`;
            
            // Skip if we already found this sub-policy
            if (subPolicies.has(id)) continue;
            
            // Get the policy type information
            const typeInfo = policyTypePatterns[typeCode] || { 
                type: typeCode, 
                description: 'Supporting document'
            };
            
            // Add to our map
            subPolicies.set(id, {
                id,
                name,
                type: typeInfo.type,
                description: typeInfo.description,
                domain
            });
        }
    }
    
    // Convert to array and sort by ID
    return Array.from(subPolicies.values()).sort((a, b) => a.id.localeCompare(b.id));
}

// Generate a sub-policy based on its ID and name
async function generateSubPolicy(policyId, policyName, policyType) {
    const orgName = window.organizationName;
    
    if (!orgName) {
        alert('Organization name not found. Please regenerate the main policies first.');
        return;
    }
    
    // Check if the sub-policy has already been generated
    const existingPolicy = document.getElementById(`policy-${policyId.toLowerCase()}`);
    if (existingPolicy) {
        // Scroll to the existing policy and highlight it
        existingPolicy.scrollIntoView({ behavior: 'smooth' });
        existingPolicy.classList.add('highlight-policy');
        setTimeout(() => {
            existingPolicy.classList.remove('highlight-policy');
        }, 2000);
        return;
    }
    
    // Create a loading indicator
    const subPoliciesContainer = document.getElementById('referenced-subpolicies');
    const loadingId = `loading-${policyId.toLowerCase()}`;
    
    // Find the button that was clicked and replace it with a loading indicator
    const buttonElement = document.querySelector(`button[onclick="generateSubPolicy('${policyId}', '${policyName}', '${policyType}')"]`);
    const originalButtonHTML = buttonElement.innerHTML;
    buttonElement.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Generating...';
    buttonElement.disabled = true;
    
    try {
        // Call API to generate the specific sub-policy
        const response = await fetch('/api/generate-subpolicy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orgName,
                policyId,
                policyName,
                policyType,
                // Include references to main policies for context
                mainPolicies: window.generatedPolicies
            })
        });
        
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        
        const generatedSubPolicy = await response.json();
        
        // Add the sub-policy to the main policies section
        const generatedPolicies = document.getElementById('generated-policies');
        const subPolicyPreview = createPolicyPreview(`${policyName} (${policyType})`, orgName, generatedSubPolicy.content, policyId);
        
        // Create a section header for sub-policies if it doesn't exist
        if (!document.getElementById('sub-policies-section')) {
            generatedPolicies.innerHTML += `
                <div id="sub-policies-section" class="w-full mb-6 mt-8 border-t border-gray-200 pt-8">
                    <h3 class="text-xl font-bold text-gray-900 mb-4">Generated Supporting Documents</h3>
                    <p class="text-gray-700 mb-4">
                        These documents support the implementation of your main AI policies.
                    </p>
                    <div id="generated-subpolicies" class="space-y-6">
                    </div>
                </div>
            `;
        }
        
        // Add the sub-policy to the generated sub-policies container
        document.getElementById('generated-subpolicies').innerHTML += subPolicyPreview;
        
        // Update the button to show "Generated"
        buttonElement.innerHTML = '<i class="fas fa-check mr-1"></i> Generated';
        buttonElement.classList.remove('bg-indigo-100', 'text-indigo-700', 'hover:bg-indigo-200');
        buttonElement.classList.add('bg-green-100', 'text-green-700');
        
        // Scroll to the newly created policy
        const newPolicyElement = document.getElementById(`policy-${policyName.toLowerCase().replace(/\s+/g, '-')}-${policyType.toLowerCase()}`);
        if (newPolicyElement) {
            newPolicyElement.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                newPolicyElement.querySelector('.policy-preview').classList.add('highlight-policy');
                setTimeout(() => {
                    newPolicyElement.querySelector('.policy-preview').classList.remove('highlight-policy');
                }, 2000);
            }, 500);
        }
    } catch (error) {
        console.error('Error generating sub-policy:', error);
        // Restore the button
        buttonElement.innerHTML = originalButtonHTML;
        buttonElement.disabled = false;
        
        // Show error message
        alert(`Error generating ${policyName}. Please try again later.`);
    }
}

// Client-side PDF generation using jsPDF
async function generateClientSidePDF(markdownContent, policyName, orgName) {
    // Check if the required libraries are loaded
    if (typeof window.jspdf === 'undefined' || typeof window.html2canvas === 'undefined') {
        throw new Error('PDF generation libraries not available');
    }
    
    // Create a new jsPDF instance
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Create a temporary container to render the markdown content
    const container = document.createElement('div');
    container.className = 'markdown-pdf-container';
    container.style.width = '170mm'; // Slightly smaller than A4 to have margins
    container.style.padding = '15mm';
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.fontFamily = 'Arial, sans-serif';
    
    // Add styling for the PDF content
    container.innerHTML = `
        <style>
            .markdown-pdf-container {
                font-family: Arial, sans-serif;
                font-size: 12pt;
                line-height: 1.5;
                color: #333;
            }
            h1 { font-size: 24pt; margin-bottom: 10mm; }
            h2 { font-size: 18pt; margin-top: 8mm; margin-bottom: 4mm; }
            h3 { font-size: 14pt; margin-top: 6mm; margin-bottom: 3mm; }
            p { margin-bottom: 4mm; }
            ul, ol { margin-bottom: 4mm; padding-left: 5mm; }
            li { margin-bottom: 2mm; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 4mm; }
            th, td { border: 1px solid #ddd; padding: 2mm; text-align: left; }
            th { background-color: #f2f2f2; }
        </style>
        <div class="pdf-header">
            <h1>${policyName}</h1>
            <p><strong>Organization:</strong> ${orgName}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
            <hr style="margin: 5mm 0;">
        </div>
        <div class="pdf-content">
            ${marked.parse(markdownContent)}
        </div>
    `;
    
    // Add the container to the document
    document.body.appendChild(container);
    
    try {
        // Render the HTML to canvas
        const canvas = await html2canvas(container, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            logging: false
        });
        
        // Convert to PDF
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        
        // Add first page
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        // Add additional pages if needed
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            doc.addPage();
            doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        // Save the PDF
        doc.save(`${orgName.replace(/\s+/g, '-')}-${policyName.replace(/\s+/g, '-')}.pdf`);
    } finally {
        // Clean up the temporary container
        if (container.parentNode) {
            container.parentNode.removeChild(container);
        }
    }
}

// Check if user needs AI Launchpad service based on AI strategy selection
function checkForLaunchpadOffer() {
    const aiStrategy = document.getElementById('ai-strategy').value;
    const launchpadOffer = document.getElementById('launchpad-offer');
    
    // Show Launchpad offer for organizations exploring AI or with informal initiatives
    if (aiStrategy === 'exploring' || aiStrategy === 'informal') {
        launchpadOffer.classList.remove('hidden');
    } else {
        launchpadOffer.classList.add('hidden');
        // Uncheck the interest checkbox if the offer is hidden
        document.getElementById('launchpad-interest').checked = false;
    }
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generatePolicies,
        createPolicyPreview,
        resetForm,
        updatePackageDisplay,
        checkForLaunchpadOffer
    };
}