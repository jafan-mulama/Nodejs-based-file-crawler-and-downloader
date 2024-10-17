import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

// Base URL of the file directory
const baseUrl = 'http://54.36.183.217';
// Directory to save downloaded files
const downloadDir = path.join(__dirname, 'downloads');

// Set to track visited URLs
const visitedUrls = new Set<string>();

// Function to sanitize filenames
function sanitizeFilename(filename: string): string {
    return filename.replace(/[<>:"/\\|?*]+/g, '_'); // Replace invalid characters with underscores
}

// Function to download a file from a URL and save it locally
async function downloadFile(url: string, filename: string): Promise<void> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to download file: ${response.statusText}`);
        }

        const fileStream = fs.createWriteStream(filename);
        response.body.pipe(fileStream);

        return new Promise<void>((resolve, reject) => {
            fileStream.on('finish', () => resolve());
            fileStream.on('error', (error) => reject(error));
        });
    } catch (error) {
        console.error(`Error downloading file ${filename}: ${error.message}`);
    }
}

// Function to scrape the directory for file links using Cheerio
async function fetchDirectoryListing(url: string): Promise<string[]> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch directory listing: ${response.statusText}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);
        const links: string[] = [];

        $('a').each((index, element) => {
            const href = $(element).attr('href');
            // Filter out URLs with query parameters like '?C=N;O=D'
            if (href && href !== './' && href !== '../' && !href.includes('?')) {
                links.push(href);
            }
        });

        return links;
    } catch (error) {
        console.error(`Error fetching directory listing: ${error.message}`);
        return [];
    }
}

// Function to download files and directories recursively
async function downloadFilesFromURL(url: string, localDir: string): Promise<void> {
    const excludedDirectory = 'node_modules'; // Exclude this directory

    // Check if this URL has already been visited
    if (visitedUrls.has(url)) {
        console.log(`Skipping already visited URL: ${url}`);
        return;
    }
    visitedUrls.add(url); // Mark the URL as visited

    // Create the local directory if it doesn't exist
    if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true });
        console.log(`Created directory: ${localDir}`);
    }

    const files: string[] = await fetchDirectoryListing(url);

    for (const file of files) {
        const fileUrl = new URL(file, url).toString(); // Complete URL
        const localFilePath = path.join(localDir, file); // Maintain full directory structure

        // Check if the link is a directory (ends with a '/')
        if (file.endsWith('/')) {
            const directoryName = path.basename(file);
            if (directoryName !== excludedDirectory) { // Exclude node_modules
                console.log(`Found directory: ${fileUrl}`);
                // Recursively download files in the directory
                await downloadFilesFromURL(fileUrl, path.join(localDir, directoryName));
            } else {
                console.log(`Skipping directory: ${directoryName}`);
            }
        } else {
            // Create directory for the file's path
            const fileDir = path.dirname(localFilePath);
            if (!fs.existsSync(fileDir)) {
                fs.mkdirSync(fileDir, { recursive: true });
            }

            console.log(`Downloading ${fileUrl} to ${localFilePath}`);
            await downloadFile(fileUrl, localFilePath);
        }
    }
}

// Run the script
downloadFilesFromURL(baseUrl, downloadDir).then(() => {
    console.log('All files downloaded successfully.');
}).catch((error) => {
    console.error('Error downloading files:', error);
});
