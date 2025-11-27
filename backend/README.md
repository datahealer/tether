# Project Title

## Overview
This project is a TypeScript-based application following the MVP (Model-View-Presenter) architecture. It is designed to provide a structured approach to building scalable and maintainable applications.

## Project Structure
The project is organized into the following directories:

- **src**: Contains the source code of the application.
  - **controllers**: Contains the controllers that handle the application logic and route requests.
  - **models**: Contains the data models used in the application.
  - **routes**: Contains the route definitions and setup.
  - **utils**: Contains utility functions that can be reused across the application.
  - **types**: Contains TypeScript interfaces and types for type safety.

- **config**: Contains configuration files for different environments and AWS settings.
  - **env**: Environment variable files for development, staging, and production.
  - **aws**: AWS configuration files for different environments.

## Environment Setup
The application supports multiple environments:
- **Development**: Configuration is found in `config/env/dev.env` and AWS settings in `config/aws/dev-aws-config.json`.
- **Staging**: Configuration is found in `config/env/stage.env` and AWS settings in `config/aws/stage-aws-config.json`.
- **Production**: Configuration is found in `config/env/prod.env` and AWS settings in `config/aws/prod-aws-config.json`.

## Development Guidelines
- **TypeScript**: The project is built using TypeScript for type safety and better development experience.
- **Linting**: ESLint is configured to maintain code quality. Ensure to run linting checks before committing code.
- **Formatting**: Prettier is used for code formatting. Follow the defined rules in `.prettierrc`.
- **Git Hooks**: Husky is set up to run pre-commit hooks to enforce code quality checks.

## Exception Handling
In cases where strict typing needs to be bypassed (e.g., using `@ts-ignore`), the following guidelines apply:
- Justification must be provided in the code comments explaining why the exception is necessary.
- Such exceptions should be reviewed and approved by a team lead or senior developer.
- Use of exceptions should be minimized and only allowed when absolutely necessary.

## CI/CD
Continuous Integration is set up using GitHub Actions. The workflow is defined in `.github/workflows/ci.yml`, which includes steps for building and testing the application.

## Getting Started
To get started with the project:
1. Clone the repository.
2. Install dependencies using `npm install`.
3. Set up the environment variables for your desired environment.
4. Run the application using `npm start`.

## License
This project is licensed under the MIT License. See the LICENSE file for details.