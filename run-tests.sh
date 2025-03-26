#!/bin/bash
# Run all tests for WhitegloveAI Policy Generator

# Define colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting test suite for WhitegloveAI Policy Generator...${NC}"
echo

# Run tests with coverage
echo -e "${YELLOW}Running Jest tests with coverage...${NC}"
npm test

# Get the exit code of the tests
TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}All tests passed successfully!${NC}"
else
  echo -e "${RED}Some tests failed. Please review the output above.${NC}"
fi

echo
echo -e "${YELLOW}Test Summary:${NC}"
echo -e "- UI Tests: Basic functionality and navigation"
echo -e "- Payment Tests: Stripe integration and checkout process"
echo -e "- Generator Tests: Policy generation and customization" 
echo -e "- Server API Tests: Backend API endpoints"
echo -e "- Pricing Consistency Tests: Ensures frontend and backend pricing match"

# Exit with the test exit code
exit $TEST_EXIT_CODE