import fs from 'fs'
import {S3} from "aws-sdk";

const s3 =new S3({
    accessKeyId:"" ,
    secretAccessKey:""
})
export const uploadFile = async (fileName: string, localFilePath: string) => {
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.upload({
      Body: fileContent,
      Bucket: "my-own-vercel",
      Key: `${fileName}`,
    }).promise();
    console.log(response);
}