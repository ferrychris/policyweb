/**
 * Generator Tests for WhitegloveAI Policy Generator
 * 
 * This file contains tests for the policy generation functionality
 * using Jest and DOM testing.
 */

// Mock DOM elements for policy generation
const setupGeneratorDOM = () => {
  document.body.innerHTML = `
    <div id="policy-form-container">
      <form id="policy-form">
        <input type="text" name="org-name" value="Test Organization" />
        <input type="checkbox" name="policy-ethics" checked />
        <input type="checkbox" name="policy-risk" checked />
        <input type="checkbox" name="policy-data" />
        <input type="checkbox" name="policy-security" />
        <input type="checkbox" name="policy-model" />
        <input type="checkbox" name="policy-vendor" />
        <input type="checkbox" name="policy-usecase" />
        <input type="checkbox" name="policy-human" />
        <input type="checkbox" name="policy-incident" />
      </form>
    </div>
    <div id="results-section" class="hidden">
      <div id="generated-policies"></div>
      <button id="download-policies">Download All Policies</button>
    </div>
  `;
};

// Import generator functions
const { generatePolicies, createPolicyPreview, resetForm } = require('../js/generator');

describe('Policy Generator', () => {
  beforeEach(() => {
    setupGeneratorDOM();
    jest.clearAllMocks();
    
    // Mock form submission event
    window.event = { preventDefault: jest.fn() };
  });

  test('generatePolicies should create policies based on selected checkboxes', () => {
    // Call generate with mock event
    generatePolicies(window.event);
    
    // Check that event.preventDefault was called
    expect(window.event.preventDefault).toHaveBeenCalled();
    
    // Check that form was hidden
    expect(document.getElementById('policy-form-container').classList.contains('hidden')).toBeTruthy();
    
    // Check that results section was shown
    expect(document.getElementById('results-section').classList.contains('hidden')).toBeFalsy();
    
    // Check that correct policies were generated (ethics and risk are checked)
    const generatedPolicies = document.getElementById('generated-policies').innerHTML;
    expect(generatedPolicies).toContain('AI Ethics Policy');
    expect(generatedPolicies).toContain('AI Risk Management Policy');
    
    // Check that unchecked policies were not generated
    expect(generatedPolicies).not.toContain('AI Data Governance Policy');
    expect(generatedPolicies).not.toContain('AI Security Policy');
  });

  test('createPolicyPreview should generate properly formatted HTML for a policy', () => {
    // Create policy preview
    const preview = createPolicyPreview('Test Policy', 'Test Corp');
    
    // Check content
    expect(preview).toContain('Test Policy');
    expect(preview).toContain('Test Corp');
    expect(preview).toContain('TEST-POLICY-001');
    expect(preview).toContain(new Date().toLocaleDateString());
    
    // Check that preview includes standard elements
    expect(preview).toContain('Policy Number');
    expect(preview).toContain('Effective Date');
    expect(preview).toContain('Purpose and Scope');
  });

  test('resetForm should hide results and show form', () => {
    // Setup initial state (results shown, form hidden)
    document.getElementById('results-section').classList.remove('hidden');
    document.getElementById('policy-form-container').classList.add('hidden');
    
    // Reset form
    resetForm();
    
    // Check final state
    expect(document.getElementById('results-section').classList.contains('hidden')).toBeTruthy();
    expect(document.getElementById('policy-form-container').classList.contains('hidden')).toBeFalsy();
  });

  test('generatePolicies should set up download button', () => {
    // Mock window.alert
    const originalAlert = window.alert;
    window.alert = jest.fn();
    
    // Generate policies
    generatePolicies(window.event);
    
    // Click download button
    document.getElementById('download-policies').click();
    
    // Check that alert was called
    expect(window.alert).toHaveBeenCalled();
    
    // Restore original alert
    window.alert = originalAlert;
  });

  test('generatePolicies should handle all policy types', () => {
    // Check all policy checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.checked = true;
    });
    
    // Generate policies
    generatePolicies(window.event);
    
    // Check that all policy types are included
    const generatedPolicies = document.getElementById('generated-policies').innerHTML;
    expect(generatedPolicies).toContain('AI Ethics Policy');
    expect(generatedPolicies).toContain('AI Risk Management Policy');
    expect(generatedPolicies).toContain('AI Data Governance Policy');
    expect(generatedPolicies).toContain('AI Security Policy');
    expect(generatedPolicies).toContain('AI Model Management Policy');
    expect(generatedPolicies).toContain('AI Procurement & Vendor Management Policy');
    expect(generatedPolicies).toContain('AI Use Case Evaluation Policy');
    expect(generatedPolicies).toContain('Human-AI Collaboration Policy');
    expect(generatedPolicies).toContain('AI Incident Response Policy');
  });
});