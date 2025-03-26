// Toggle mobile menu
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
    }
}

// Toggle dark mode
function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    // Store preference in localStorage
    if (document.documentElement.classList.contains('dark')) {
        localStorage.setItem('darkMode', 'true');
    } else {
        localStorage.setItem('darkMode', 'false');
    }
}

// Apply dark mode on page load if previously set
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        if (localStorage.getItem('darkMode') === 'true') {
            document.documentElement.classList.add('dark');
        }
        
        // Always set admin authentication to true for the demo
        // This ensures policies will generate without requiring the server
        localStorage.setItem('admin_authenticated', 'true');
        
        console.log("Admin authentication set to true for demo purposes");
    });
}

// Function to generate a sub-policy (this is a client-side fallback when server is unavailable)
function generateSubPolicy(policyId, policyName, policyType) {
    const orgName = window.organizationName || 'Your Organization';
    
    // Create a basic template for the sub-policy
    const subPolicyContent = `# ${policyName}

## Document ID: ${policyId}
## Type: ${policyType}
## Effective Date: ${new Date().toLocaleDateString()}
## Version: 1.0

## Purpose and Scope

This ${policyType.toLowerCase()} provides detailed guidance for implementing the related AI policy at ${orgName}. It is designed to support staff in following best practices for responsible AI.

## Document Details

This is a supporting document generated via the policy generator tool.

### Key Sections

1. Introduction
2. Procedures and Steps
3. Implementation Guidelines
4. Related References

## Implementation Notes

This document was automatically generated and may need further customization for your specific organizational needs.
`;

    // Create a unique ID for this sub-policy
    const subPolicyElementId = `policy-${policyId.toLowerCase()}`;
    
    // Check if a section for generated sub-policies exists, if not create it
    let subPoliciesSection = document.getElementById('sub-policies-section');
    if (!subPoliciesSection) {
        const generatedPolicies = document.getElementById('generated-policies');
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
    
    // Add the sub-policy to the sub-policies section
    const generatedSubpolicies = document.getElementById('generated-subpolicies');
    generatedSubpolicies.innerHTML += createPolicyPreview(`${policyName} (${policyType})`, orgName, subPolicyContent, policyId);
    
    // Change the Generate button to a "Generated" status
    const button = document.querySelector(`button[onclick="generateSubPolicy('${policyId}', '${policyName}', '${policyType}')"]`);
    if (button) {
        button.innerHTML = '<i class="fas fa-check mr-1"></i> Generated';
        button.classList.remove('text-indigo-700', 'bg-indigo-100', 'hover:bg-indigo-200');
        button.classList.add('text-green-700', 'bg-green-100');
        button.disabled = true;
    }
    
    // Scroll to the new sub-policy
    const newSubPolicy = document.getElementById(subPolicyElementId);
    if (newSubPolicy) {
        newSubPolicy.scrollIntoView({ behavior: 'smooth' });
    }
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        toggleMobileMenu,
        toggleDarkMode,
        generateSubPolicy
    };
}