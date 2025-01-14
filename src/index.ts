#!/usr/bin/env node

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import chalk from 'chalk';

// For ESM, use this to get the current directory of the module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define available templates
const templates = ['ts-cloudrun']; // Example templates, add more if needed

// Ask for project name and template selection
const answers = await inquirer.prompt([
    {
        type: 'input',
        name: 'projectName',
        message: 'Enter your project name:',
    },
    {
        type: 'list',
        name: 'templateName',
        message: 'Choose a template for your project:',
        choices: templates, // Provide choices to pick from
    },
]);

const { projectName, templateName } = answers;
console.log(`Project Name: ${projectName}`);
console.log(`Selected Template: ${templateName}`);

// Resolve the template path from the root directory
const templateDir = path.resolve(__dirname, '..', '..', 'src', 'templates', templateName);
const targetDir = path.resolve(process.cwd(), projectName); // Target directory for the new project

async function setupProject() {
    try {
        // Check if the template directory exists
        if (!fs.existsSync(templateDir)) {
            console.error(chalk.red(`Template directory not found: ${templateDir}`));
            return;
        }

        // Ensure the target directory does not already exist
        if (fs.existsSync(targetDir)) {
            console.log(chalk.yellow(`Directory ${targetDir} already exists. Overwriting...`));
        } else {
            fs.mkdirSync(targetDir, { recursive: true }); // Create the target directory if it doesn't exist
        }

        // Log before copying
        console.log('Starting the copy operation...');

        // Copy the selected template to the target directory
        console.log(`Copying template to ${targetDir}...`);
        await fs.copy(templateDir, targetDir); // This is the async operation

        // Check if the project directory exists after the copy operation
        if (fs.existsSync(targetDir)) {
            console.log(chalk.green(`Files copied successfully. Your project is ready at ${targetDir}`));
        } else {
            console.error(chalk.red(`Error: Files were not copied to ${targetDir}.`));
        }

    } catch (error) {
        console.error(chalk.red('Error during setup'), error);
    }
}

// Run the setup
(async () => {
    await setupProject();
})();
