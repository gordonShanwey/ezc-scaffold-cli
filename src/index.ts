#!/usr/bin/env node

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora'; // Import ora for spinner functionality
import { execSync } from 'child_process';  // To run git commands

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
    const spinner = ora('Starting the setup process...').start(); // Initialize spinner

    try {
        // Check if the template directory exists
        if (!fs.existsSync(templateDir)) {
            spinner.fail(`Template directory not found: ${templateDir}`);
            return;
        }

        // Ensure the target directory does not already exist
        if (fs.existsSync(targetDir)) {
            console.log(chalk.yellow(`Directory ${targetDir} already exists. Overwriting...`));
        } else {
            fs.mkdirSync(targetDir, { recursive: true }); // Create the target directory if it doesn't exist
        }

        // Start copying raw template files (exclude .git directory)
        spinner.text = `Copying raw template files to ${targetDir}...`;
        await fs.copy(templateDir, targetDir, {
            // Exclude .git directory if present in the template
            filter: (src) => !src.includes('.git'),
        });

        // Check if the project directory exists after the copy operation
        if (fs.existsSync(targetDir)) {
            spinner.succeed(chalk.green(`Files copied successfully. Your project is ready at ${targetDir}`));

            // Initialize a new Git repository
            spinner.start('Initializing a new Git repository...');
            execSync('git init', { cwd: targetDir }); // Initialize Git in the target directory
            spinner.succeed('Git repository initialized');

            // Optionally: Add remote origin (ask user for GitHub URL, for example)
            // const { remoteUrl } = await inquirer.prompt([
            //     {
            //         type: 'input',
            //         name: 'remoteUrl',
            //         message: 'Enter your GitHub repository URL (optional):',
            //         default: '',
            //     },
            // ]);
            //
            // if (remoteUrl) {
            //     // Set the remote origin
            //     execSync(`git remote add origin ${remoteUrl}`, { cwd: targetDir });
            //     execSync('git branch -M main', { cwd: targetDir });  // Rename branch to 'main'
            //     spinner.start('Pushing to remote repository...');
            //     execSync('git push -u origin main', { cwd: targetDir });
            //     spinner.succeed('Pushed to remote repository');
            // }
        } else {
            spinner.fail(chalk.red(`Error: Files were not copied to ${targetDir}.`));
        }

    } catch (error) {
        spinner.fail('Error during setup');
        console.error(chalk.red('Error during setup'), error);
    }
}

// Run the setup
(async () => {
    await setupProject();
})();
