# game-on 

[![CI](https://github.com/cl0h/game-on/actions/workflows/ci.yml/badge.svg)](https://github.com/cl0h/game-on/actions/workflows/ci.yml) [![Coverage Status](https://coveralls.io/repos/github/cl0h/game-on/badge.svg?branch=master)](https://coveralls.io/github/cl0h/game-on?branch=master) [![Maintainability](https://api.codeclimate.com/v1/badges/8e346e15b0d380249bda/maintainability)](https://codeclimate.com/github/cl0h/game-on/maintainability) [![dependencies Status](https://status.david-dm.org/gh/cl0h/game-on.svg)](https://david-dm.org/cl0h/game-on)

## Intro
A web application where people can let others know they would like to play a game (foosball, ping pong etc.)


This application runs on Node.JSand uses the Socket.IO library to send messages via WebSockets. 


## Install
- Install node
- From the cloned project path execute the commands:
  - npm install
  - node index.js"


## Usage
- Access via a browser locally using http://localhost:3000
- When the page loads you need to choose to allow the page to send you notifications.
- Add your name and click "Notify Me". You will be notified when 4 "registrations" occur. 
- Share your IP and port with others so they can access. You may need to allow connections through firewall.
- You can add more than one "registration" from a single browser.
- There is also a very basic chat feature you can use without signing up for a game.
- Have fun :)


## CI/CD

This project uses GitHub Actions for continuous integration and continuous deployment. The CI pipeline automatically runs on every push and pull request to ensure code quality and functionality.

### Workflows

#### CI Pipeline
The CI workflow (`.github/workflows/ci.yml`) runs the following checks:
- **Code Linting**: Runs `npm run code:analysis` using jshint to check code quality
- **Unit Tests**: Executes the Jest test suite with `npm test`

The workflow runs on multiple Node.js versions (18.x and 20.x) to ensure compatibility.

**Note**: The CI workflow currently uses `continue-on-error` for linting and testing steps to allow merging during the initial setup phase. See `KNOWN_ISSUES.md` for issues that need to be fixed before enabling strict enforcement.

#### Security Scanning
The CodeQL workflow (`.github/workflows/codeql-analysis.yml`) performs security analysis to identify potential vulnerabilities in the codebase.

### Branch Protection

To maintain code quality, it's recommended to enable branch protection rules on the `master` branch with the following settings:
- Require pull request reviews before merging
- Require status checks to pass before merging (CI workflow)
- Require branches to be up to date before merging

### Status Badges

The build status badge at the top of this README shows the current status of the CI pipeline. Click on the badge to view detailed workflow run information on GitHub Actions.
