import { S3 } from "aws-sdk";
import fs, { mkdir } from "fs";
import path from "path";

const s3 = new S3({
    accessKeyId: "",
    secretAccessKey: "",
    region: ""

})
async function listObjectsWithPrefix(bucketName: string, prefix: string): Promise<string[]> {
    // Convert forward slashes to backslashes to match the stored format
    const normalizedPrefix = prefix.replace(/\//g, '\\');
    
    const params = {
        Bucket: bucketName,
        Prefix: normalizedPrefix
    };

    try {
        const data = await s3.listObjectsV2(params).promise();
        return data.Contents?.map(obj => obj.Key || "").filter(key => key !== "") ?? [];
    } catch (error) {
        console.error("Error listing objects:", error);
        throw error;
    }
}

async function downloadObject(
    bucketName: string,
    objectKey: string,
    baseDownloadFolder: string
) {
    const params = {
        Bucket: bucketName,
        Key: objectKey // Keep the original key format for S3 operations
    };

    try {
        const data = await s3.getObject(params).promise();

        if (!data.Body) {
            console.error(`Error downloading ${objectKey}: Body is undefined`);
            return;
        }

        // Convert backslashes to forward slashes for local file system
        const localObjectKey = objectKey.replace(/\\/g, path.sep);
        const filePath = path.join(baseDownloadFolder, localObjectKey);
        const dirName = path.dirname(filePath);

        if (!fs.existsSync(dirName)) {
            fs.mkdirSync(dirName, { recursive: true });
        }

        fs.writeFileSync(filePath, data.Body as Buffer);
        console.log(`Downloaded: ${objectKey} -> ${filePath}`);
    } catch (error) {
        console.error(`Error downloading ${objectKey}:`, error);
        throw error;
    }
}

export async function listAndDownload(
    bucketName: string,
    prefix: string
) {
    try {
        const downloadPath = __dirname;
        console.log(`Download path: ${downloadPath}`);

        const objectKeys = await listObjectsWithPrefix(bucketName, prefix);

        if (objectKeys.length === 0) {
            console.log("No matching files found.");
            return;
        }

        console.log(`Found ${objectKeys.length} files. Downloading...`);

        for (const key of objectKeys) {
            if (bucketName && key) {
                await downloadObject(bucketName, key, downloadPath);
            }
        }

        console.log("All downloads complete!");
    } catch (error) {
        console.error("Error in listAndDownload:", error);
        throw error;
    }
}

export function copyFinalDist(id: string) {
    // Convert forward slashes to backslashes for S3 keys
    const folderPath = path.join(__dirname, `output${path.sep}${id}${path.sep}dist`);

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    const allFiles = getAllFiles(folderPath);
    allFiles.forEach(file => {
        // Convert path separators to backslashes for S3 key
        const relativePath = file.slice(folderPath.length + 1).replace(/\//g, '\\');
        const s3Key = `dist\\${id}\\${relativePath}`;
        uploadFile(s3Key, file);
    });
}

const getAllFiles = (folderPath: string): string[] => {
    let response: string[] = [];

    const allFilesAndFolders = fs.readdirSync(folderPath);
    allFilesAndFolders.forEach(file => {
        const fullFilePath = path.join(folderPath, file);
        if (fs.statSync(fullFilePath).isDirectory()) {
            response = response.concat(getAllFiles(fullFilePath));
        } else {
            response.push(fullFilePath);
        }
    });
    return response;
}

const uploadFile = async (fileName: string, localFilePath: string) => {
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: "my-own-vercel",
        Key: fileName,
    }).promise();
    console.log(response);
}