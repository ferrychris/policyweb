// Initialize Stripe - with a working test key
const stripe = typeof Stripe !== 'undefined' ? Stripe('pk_test_TYooMQauvdEDq54NiTphI7jx') : null;
// For development without backend, we can use simulated payments
const elements = stripe ? stripe.elements() : null;

// Create the payment modal elements when needed
let card;

// Product prices - aligned with pricing.html
const PRODUCTS = {
    'basic_plan': {
        name: 'Basic Plan',
        price: 900,
        description: '3 core policy templates with simple customization'
    },
    'professional_package': {
        name: 'Professional Package',
        price: 1500,
        description: '8 essential policy templates with standard customization'
    },
    'premium_suite': {
        name: 'Premium Suite',
        price: 5000,
        description: 'Full suite of 19 policy templates with advanced customization'
    }
};

// Open payment modal with product selection
function checkout(productId) {
    if (!PRODUCTS[productId]) {
        console.error(`Product ID ${productId} not found`);
        return;
    }
    
    const modal = document.getElementById('payment-modal');
    modal.classList.remove('hidden');
    
    // Set product details in modal
    document.getElementById('payment-modal-title').textContent = `Complete Purchase: ${PRODUCTS[productId].name}`;
    document.getElementById('product-name').textContent = PRODUCTS[productId].name;
    document.getElementById('product-price').textContent = `$${PRODUCTS[productId].price.toFixed(2)}`;
    
    // Create card element if it doesn't exist
    if (!card) {
        const style = {
            base: {
                color: '#32325d',
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': {
                    color: '#aab7c4'
                }
            },
            invalid: {
                color: '#fa755a',
                iconColor: '#fa755a'
            }
        };
        
        card = elements.create('card', {style: style});
        card.mount('#card-element');
        
        // Handle validation errors
        card.addEventListener('change', function(event) {
            const displayError = document.getElementById('card-errors');
            if (event.error) {
                displayError.textContent = event.error.message;
            } else {
                displayError.textContent = '';
            }
        });
    }
    
    // Handle form submission
    const submitButton = document.getElementById('submit-payment');
    const form = document.getElementById('payment-form');
    
    // Remove previous event listeners
    const newSubmitButton = submitButton.cloneNode(true);
    submitButton.parentNode.replaceChild(newSubmitButton, submitButton);
    
    // Add new event listener
    newSubmitButton.addEventListener('click', function() {
        processPayment(productId);
    });
}

// Close payment modal
function closePaymentModal() {
    document.getElementById('payment-modal').classList.add('hidden');
    // Reset errors
    document.getElementById('card-errors').textContent = '';
    // Reset button
    document.getElementById('submit-payment').disabled = false;
    document.getElementById('submit-payment').textContent = 'Pay Now';
}

// Process the payment with Stripe
async function processPayment(productId) {
    const email = document.getElementById('customer-email').value;
    
    if (!email) {
        document.getElementById('card-errors').textContent = 'Please enter your email address.';
        return;
    }
    
    const submitButton = document.getElementById('submit-payment');
    submitButton.disabled = true;
    submitButton.textContent = 'Processing...';
    
    try {
        // Step 1: Make an API call to the server to create a PaymentIntent
        // Toggle between production and simulation mode
        const USE_REAL_PAYMENT_API = false; // Set to true to use real Stripe API
        
        let clientSecret;
        let result;
        
        if (USE_REAL_PAYMENT_API) {
            // Make actual API call to backend
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    productId: productId,
                    email: email 
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create payment intent');
            }
            
            const paymentData = await response.json();
            clientSecret = paymentData.clientSecret;
            
            // Step 2: Process payment based on the payment element
            result = await processStripePayment(clientSecret, email);
        } else {
            // Simulation mode for testing without backend
            console.log('Processing payment for:', productId, 'with email:', email);
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Simulate successful payment
            result = { paymentIntent: { status: 'succeeded' } };
        }
        
        if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
            // Payment successful
            console.log('Payment successful!');
            
            // Set authentication flag in localStorage
            localStorage.setItem('authenticated', 'true');
            localStorage.setItem('purchased_package', productId);
            
            // Close payment modal
            closePaymentModal();
            
            // Show success modal
            document.getElementById('success-modal').classList.remove('hidden');
        } else {
            // Payment failed
            throw new Error('Payment failed');
        }
    } catch (error) {
        // Show error in the payment form
        const errorElement = document.getElementById('card-errors');
        errorElement.textContent = error.message || 'An error occurred while processing your payment.';
        
        // Re-enable the submit button
        submitButton.disabled = false;
        submitButton.textContent = 'Pay Now';
    }
}

// Initialize Stripe payment for the policy generator
async function initializePayment(productId, email, includeLaunchpad = false) {
    if (!PRODUCTS[productId]) {
        console.error(`Product ID ${productId} not found`);
        return;
    }
    
    // Calculate total amount
    let totalAmount = PRODUCTS[productId].price;
    if (includeLaunchpad) {
        totalAmount += 3500; // Add Launchpad price
    }
    
    // Create payment element
    if (stripe) {
        // Clear any existing payment elements
        const paymentElement = document.getElementById('payment-element');
        if (paymentElement) {
            paymentElement.innerHTML = '';
        }
        
        // Create a new elements instance
        const newElements = stripe.elements({
            mode: 'payment',
            amount: totalAmount * 100, // Convert to cents
            currency: 'usd',
            appearance: {
                theme: 'stripe',
                variables: {
                    colorPrimary: '#6366f1',
                    colorBackground: '#ffffff',
                    colorText: '#32325d',
                    colorDanger: '#df1b41',
                    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    spacingUnit: '4px',
                    borderRadius: '4px'
                },
                rules: {
                    '.Input': {
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    },
                    '.Input:focus': {
                        border: '1px solid #6366f1',
                        boxShadow: '0 0 0 1px #6366f1'
                    }
                }
            }
        });
        
        // Create and mount the Payment Element
        const paymentElementOptions = {
            layout: {
                type: 'tabs',
                defaultCollapsed: false
            },
            fields: {
                billingDetails: 'never' // We collect this separately
            }
        };
        
        card = newElements.create('payment', paymentElementOptions);
        card.mount('#payment-element');
        
        // Handle validation and form state
        card.on('change', (event) => {
            const displayError = document.getElementById('card-errors');
            const submitButton = document.getElementById('payment-submit-button');
            
            if (event.error) {
                displayError.textContent = event.error.message;
            } else {
                displayError.textContent = '';
            }
            
            // Enable the submit button if the form is complete
            if (event.complete) {
                submitButton.disabled = false;
                submitButton.innerHTML = `Complete Purchase ($${totalAmount.toLocaleString()})`;
            } else {
                submitButton.disabled = true;
                submitButton.innerHTML = 'Please complete payment details';
            }
        });
    }
    
    // Handle form submission
    const paymentForm = document.getElementById('payment-form');
    const submitButton = document.getElementById('payment-submit-button');
    
    // Prevent default form submission and use our custom handler
    paymentForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Check if we have Launchpad data
        const policyData = JSON.parse(sessionStorage.getItem('pendingPolicyData'));
        const includeLaunchpad = policyData && policyData.includeLaunchpad;
        
        // Get form data
        const formData = {
            name: document.getElementById('customer-name').value,
            email: document.getElementById('customer-email').value,
            phone: document.getElementById('customer-phone').value,
            company: document.getElementById('customer-company').value,
            role: document.getElementById('customer-role').value,
            address: {
                street: document.getElementById('customer-address').value,
                city: document.getElementById('customer-city').value,
                state: document.getElementById('customer-state').value,
                zip: document.getElementById('customer-zip').value,
                country: document.getElementById('customer-country').value
            }
        };
        
        // Store the customer information for future use
        sessionStorage.setItem('customerInfo', JSON.stringify(formData));
        
        // Process payment with full customer data
        completePaymentAndGeneratePolicies(productId, formData.email, includeLaunchpad, formData);
    });
}

// Process payment and generate policies
async function completePaymentAndGeneratePolicies(productId, email, includeLaunchpad = false, customerInfo = null) {
    if (!email) {
        email = 'customer@example.com'; // Default if not provided
    }
    
    const submitButton = document.getElementById('payment-submit-button');
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';
    
    try {
        // Step 1: Make an API call to the server to create a PaymentIntent
        // Toggle between production and simulation mode
        const USE_REAL_PAYMENT_API = false; // Set to true to use real Stripe API
        
        let clientSecret;
        let result;
        
        // Calculate total amount
        let totalAmount = PRODUCTS[productId].price;
        if (includeLaunchpad) {
            totalAmount += 3500; // Add Launchpad price
        }
        
        if (USE_REAL_PAYMENT_API) {
            // Make actual API call to backend
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    productId: productId,
                    email: email,
                    includeLaunchpad: includeLaunchpad,
                    customerInfo: customerInfo 
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create payment intent');
            }
            
            const paymentData = await response.json();
            clientSecret = paymentData.clientSecret;
            
            // Step 2: Process payment based on the payment element
            result = await processStripePayment(clientSecret, email, customerInfo);
        } else {
            // Simulation mode for testing without backend
            console.log('Processing payment for:', productId, 'with email:', email);
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Simulate successful payment
            result = { paymentIntent: { status: 'succeeded' } };
        }
        
        if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
            // Payment successful
            console.log('Payment successful!');
            
            // Set authentication flag in localStorage
            localStorage.setItem('authenticated', 'true');
            localStorage.setItem('purchased_package', productId);
            
            // Get the pending policy data and generate
            const policyData = JSON.parse(sessionStorage.getItem('pendingPolicyData'));
            
            // Add customer info to the policy data if available
            if (customerInfo) {
                policyData.customerInfo = customerInfo;
                sessionStorage.setItem('pendingPolicyData', JSON.stringify(policyData));
            }
            
            // Show success message temporarily
            const successMessage = document.createElement('div');
            successMessage.className = 'fixed top-0 inset-x-0 p-4 bg-green-100 border-b border-green-400 text-green-800 text-center';
            successMessage.innerHTML = `
                <div class="flex justify-center items-center">
                    <i class="fas fa-check-circle text-green-500 mr-2 text-xl"></i>
                    <span class="font-medium">Payment successful! Generating your customized policies...</span>
                </div>
            `;
            document.body.prepend(successMessage);
            
            // Remove message after a delay
            setTimeout(() => {
                if (successMessage.parentNode) {
                    successMessage.remove();
                }
            }, 3000);
            
            // Generate policies
            generatePoliciesForUser(policyData);
        } else {
            // Payment failed
            throw new Error('Payment failed or was canceled');
        }
    } catch (error) {
        // Show error in the payment form
        const errorElement = document.getElementById('card-errors');
        errorElement.textContent = error.message || 'An error occurred while processing your payment.';
        
        // Calculate correct total amount for error message
        let totalAmount = PRODUCTS[productId].price;
        if (includeLaunchpad) {
            totalAmount += 3500;
        }
        
        // Re-enable the submit button
        submitButton.disabled = false;
        submitButton.innerHTML = `Pay $${totalAmount.toLocaleString()}`;
    }
}

/**
 * Process a payment using the Stripe payment elements API
 * @param {string} clientSecret - The client secret from the PaymentIntent
 * @param {string} email - The customer's email address
 * @param {object} customerInfo - Additional customer information
 * @returns {Promise<object>} - The result of the payment processing
 */
async function processStripePayment(clientSecret, email, customerInfo = null) {
    try {
        // Using Stripe's new payment element
        // Get the elements instance - if we have a new one use it, otherwise use the global one
        const elementsInstance = typeof newElements !== 'undefined' ? newElements : elements;
        return await stripe.confirmPayment({
            elements: elementsInstance,
            clientSecret: clientSecret,
            confirmParams: {
                return_url: window.location.href,
                payment_method_data: {
                    billing_details: {
                        name: customerInfo ? customerInfo.name : email,
                        email: email,
                        phone: customerInfo ? customerInfo.phone : '',
                        address: customerInfo ? {
                            line1: customerInfo.address.street,
                            city: customerInfo.address.city,
                            state: customerInfo.address.state,
                            postal_code: customerInfo.address.zip,
                            country: customerInfo.address.country
                        } : {}
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error processing payment:', error);
        throw error;
    }
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PRODUCTS,
        checkout,
        closePaymentModal,
        processPayment,
        initializePayment,
        completePaymentAndGeneratePolicies,
        processStripePayment
    };
}

// Add some form validation for better user experience
document.addEventListener('DOMContentLoaded', function() {
    // If we're on a page with the payment form, add validation 
    setTimeout(() => {
        const paymentForm = document.getElementById('payment-form');
        if (paymentForm) {
            const inputs = paymentForm.querySelectorAll('input[required]');
            
            // Add validation styling
            inputs.forEach(input => {
                input.addEventListener('blur', function() {
                    if (!this.value.trim()) {
                        this.classList.add('border-red-500');
                        // Add validation message if not already present
                        if (!this.nextElementSibling || !this.nextElementSibling.classList.contains('validation-message')) {
                            const message = document.createElement('p');
                            message.classList.add('validation-message', 'text-red-500', 'text-xs', 'mt-1');
                            message.textContent = 'This field is required';
                            this.parentNode.insertBefore(message, this.nextSibling);
                        }
                    } else {
                        this.classList.remove('border-red-500');
                        // Remove validation message if present
                        if (this.nextElementSibling && this.nextElementSibling.classList.contains('validation-message')) {
                            this.nextElementSibling.remove();
                        }
                    }
                });
                
                // Remove error styling when typing
                input.addEventListener('input', function() {
                    if (this.value.trim()) {
                        this.classList.remove('border-red-500');
                        // Remove validation message if present
                        if (this.nextElementSibling && this.nextElementSibling.classList.contains('validation-message')) {
                            this.nextElementSibling.remove();
                        }
                    }
                });
            });
        }
    }, 1000); // Delay to ensure the form is rendered
});