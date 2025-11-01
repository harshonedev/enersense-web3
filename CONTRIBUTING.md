# Contributing to EnerSense

Thank you for your interest in contributing to EnerSense! This document provides guidelines for contributing to the project.

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please be respectful and constructive in all interactions.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/your-org/enersense-web3/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Environment details (OS, browser, Node version)

### Suggesting Features

1. Check existing feature requests
2. Create a new issue with `[Feature Request]` prefix
3. Describe the feature and its use case
4. Explain why it would benefit users

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Write or update tests
5. Ensure all tests pass: `npm test`
6. Commit with descriptive messages
7. Push to your fork
8. Create a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/enersense-web3
cd enersense-web3

# Install dependencies
npm install
cd blockchain && npm install && cd ..

# Set up environment
cp .env.local.example .env.local
# Fill in your values

# Run development server
npm run dev
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Avoid `any` types when possible
- Document complex functions

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper prop types

### Smart Contracts

- Follow Solidity best practices
- Add NatSpec comments
- Write comprehensive tests
- Consider gas optimization
- Security first approach

### Commit Messages

Follow conventional commits:

```
feat: add energy tracking dashboard
fix: resolve token minting issue
docs: update kWALA integration guide
test: add marketplace contract tests
chore: update dependencies
```

## Testing

### Frontend Tests

```bash
npm run test
npm run test:watch
npm run test:coverage
```

### Smart Contract Tests

```bash
cd blockchain
npm run test
npm run test:gas
npm run coverage
```

### End-to-End Tests

```bash
npm run test:e2e
```

## Documentation

- Update README.md for major features
- Add inline code comments for complex logic
- Create guides in `/docs` for new integrations
- Update API documentation

## Project Structure

```
enersense-web3/
├── app/              # Next.js pages and API routes
├── components/       # React components
├── lib/             # Utility libraries
├── blockchain/      # Smart contracts
├── docs/            # Documentation
└── types/           # TypeScript types
```

## Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, your PR will be merged
4. Your contribution will be credited

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to ask questions by:
- Opening a discussion
- Joining our Discord
- Emailing the team

Thank you for contributing to EnerSense! 🌱⚡
