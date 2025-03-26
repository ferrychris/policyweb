# WhitegloveAI Policy Generator

A comprehensive web application for generating and purchasing customized AI governance policies. This application uses Claude AI to intelligently customize policies based on your organization's needs and Stripe for secure payment processing.

## Features

- Generate up to 19 different AI governance policies
- Customize policies based on your organization's profile and needs
- Three pricing tiers: Basic, Professional, and Premium
- Secure payment processing with Stripe
- Mobile-responsive design
- Download policies in multiple formats

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- A modern web browser

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/policy-generator.git
cd policy-generator
```

2. Install dependencies
```bash
npm install
```

3. Create an environment file
```bash
# Create a .env file with the following variables
cp .env.example .env

# Edit the file and add your API keys
# CLAUDE_API_KEY=your_claude_api_key
# STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
# STRIPE_SECRET_KEY=your_stripe_secret_key
```

### Running Locally

1. Start the Express server
```bash
node server.js
```

2. Access the application
Open your browser and navigate to `http://localhost:8080`

### Alternative Simple Server Method

If you don't need the full backend functionality during development, you can use a simple HTTP server:

```bash
# Using Python 3
python -m http.server 8080

# OR using Node.js
npx serve -l 8080
```

## Application Structure

### Policy Generation Process

The application follows a structured workflow:

1. **Package Selection**: Users choose from Basic, Professional, or Premium packages
2. **Questionnaire**: Users provide organization details and customize policy needs
3. **Payment Processing**: Secure payment handled through Stripe integration
4. **Policy Generation**: Claude AI generates customized policies based on inputs
5. **Download**: Users can download policies in PDF and Word formats

### Policy Types Available

The application offers up to 19 different AI governance policies, including:

#### Basic Package ($900)
- AI Ethics Policy
- AI Risk Management Policy
- AI Data Governance Policy

#### Professional Package ($1,500)
- All Basic policies, plus:
- AI Security Policy
- AI Model Management Policy
- Human Oversight Policy
- AI Compliance Policy
- AI Use Case Evaluation Policy

#### Premium Package ($5,000)
- All Professional policies, plus:
- AI Procurement & Vendor Management
- Responsible AI Deployment
- AI Training & Capability Development
- AI Incident Response
- AI Governance Committee
- AI Transparency
- 7 additional specialized policies

## Technical Implementation

### Claude AI Integration

The application uses Claude AI to generate customized policies through:

- `js/claude-policy-agent.js`: Manages communication with Claude API
- Policy templates in the `/policy-templates` directory
- Intelligent customization based on organization profile (name, size, industry, etc.)

### Stripe Payment Integration

Payment processing uses Stripe with:

- Client-side Stripe Elements for secure card input
- Payment simulation mode for testing (default)
- Enable real payments by setting `USE_REAL_PAYMENT_API = true` in `js/payments.js`

### Directory Structure

```
/
├── css/                  # Stylesheets
├── js/                   # JavaScript files
│   ├── claude-policy-agent.js  # Claude API integration
│   ├── generator.js      # Policy generation logic
│   ├── payments.js       # Stripe integration
│   └── main.js           # Core functionality
├── policy-templates/     # Policy template files
├── tests/                # Test files
├── server.js             # Express server
└── *.html                # HTML pages
```

## Testing

Run the test suite with:

```bash
npm test
```

## Deployment

For production deployment:

1. Use production API keys in `.env`
2. Set `NODE_ENV=production`
3. Deploy to your preferred hosting service

## License

MIT License © 2025 WhitegloveAI