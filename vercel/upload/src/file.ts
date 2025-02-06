const fs = require('fs');
const path = require('path');

export const getAllFiles = (folderPath: string) => {
    let response: string[] = [];
    
    const allFilesAndFolder = fs.readdirSync(folderPath);
    allFilesAndFolder.forEach((file: any) => {
        if (file === '.git') return;  // Added this line to skip .git directories
        
        const fullFilePath = path.join(folderPath, file);
        if(fs.statSync(fullFilePath).isDirectory()) {  // Added parentheses
            response = response.concat(getAllFiles(fullFilePath));
        } else {
            response.push(fullFilePath);
        }
    });
    return response;
}