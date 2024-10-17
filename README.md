# Node.js-based-file-crawler-and-downloader.
This Node.js script recursively downloads files from a specified base URL and saves them locally, maintaining the directory structure. It uses node-fetch to fetch files, cheerio to parse directory listings, and fs for file operations. It avoids revisiting URLs and skips excluded directories.
### Detailed Explanation

1. **Importing Modules**:
   - The code uses four key modules:
     - `fs`: Handles file system operations like creating directories and writing files.
     - `path`: Helps manage and construct file paths.
     - `cheerio`: A fast, flexible, and lean implementation of jQuery for server-side HTML manipulation, used here to parse directory listings.
     - `node-fetch`: Makes HTTP requests to fetch files and directory listings from a remote server.

2. **Global Variables**:
   - `baseUrl`: The starting point of the file directory (e.g., `http://example.com`). This is the remote server's URL where the files are hosted.
   - `downloadDir`: The local directory where all the downloaded files will be stored. It uses the `path` module to create a folder named `downloads` in the current directory.
   - `visitedUrls`: A `Set` to keep track of URLs already visited, ensuring that directories aren't processed multiple times, preventing infinite loops.

3. **Helper Functions**:
   - **`sanitizeFilename(filename)`**: This function sanitizes filenames by removing characters that are not allowed in filenames (e.g., `<>:"/\\|?*`). It replaces them with underscores to ensure filenames are safe to use.
   
   - **`downloadFile(url, filename)`**: Downloads a file from the given `url` and saves it locally to the specified `filename`. It uses `fetch` to make the HTTP request and `fs.createWriteStream` to write the file to disk. Errors are caught and logged.
   
   - **`fetchDirectoryListing(url)`**: Fetches the HTML of a directory listing from the given `url` using `fetch`. It parses the HTML with `cheerio` and extracts all anchor (`<a>`) tags to get links for files and subdirectories. It filters out unnecessary links like `./`, `../`, and those with query parameters (e.g., `?C=N;O=D`).

4. **Main Function - `downloadFilesFromURL(url, localDir)`**:
   - The core function of the script that downloads files from the specified URL and stores them locally:
     - Accepts two parameters: 
       - `url`: The URL of the current directory being crawled.
       - `localDir`: The local directory where downloaded files are saved.
     
     - **Check for Already Visited URLs**: Uses `visitedUrls` to prevent revisiting URLs, ensuring efficient crawling.
     
     - **Create Local Directory**: If the local directory doesn't exist, it creates it using `fs.mkdirSync`, preserving the folder structure.
     
     - **Fetch Directory Listing**: Calls `fetchDirectoryListing` to get a list of files and directories.
     
     - **Process Files and Directories**: 
       - For directories (ending with `/`), it recursively calls `downloadFilesFromURL` to download the contents.
       - For files, it downloads them using `downloadFile`, saving them locally while maintaining the directory structure.

     - **Directory Exclusion**: The script skips directories like `node_modules` as defined by the `excludedDirectory` variable. This can be customized to exclude other directories as needed.

5. **Running the Script**:
   - The script calls `downloadFilesFromURL` with the `baseUrl` and the local `downloadDir`. Upon completion, a success message is logged, while any errors are handled and logged.

### Example Workflow

1. The script starts at a given base URL (e.g., `http://example.com`), downloads the files and directories, and stores them locally in a `downloads/` folder.
2. It recursively enters subdirectories and downloads files, excluding directories like `node_modules` or others defined by the user.
3. The result is a local mirror of the remote directory structure.

### Installation and Usage (for GitHub README)

To use this project, ensure you have Node.js installed. Follow these steps:

1. **Clone the Repository**:

   ```bash
   gh repo clone jafan-mulama/Nodejs-based-file-crawler-and-downloader
   cd Nodejs-based-file-crawler-and-downloader
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Run the Script**:

   ```bash
   node crawler.js
   ```

4. The files will be downloaded into the `downloads/` folder in your project directory.

### Customization

- **Change the Base URL**: Update the `baseUrl` variable at the top of the script to point to the remote directory you'd like to download.
- **Exclude Other Directories**: Modify the `excludedDirectory` variable to exclude specific directories from the download process.

