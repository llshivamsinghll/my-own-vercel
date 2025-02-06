import express, { Request, Response } from 'express';
import generateId from './utils/generate'; // Import the generateId function
import { getAllFiles } from './file';
import { uploadFile } from "./aws"
import simpleGit from "simple-git";
import { createClient } from "redis";
import path from 'path';

const cors = require('cors');

const redis = createClient();

const app = express();

app.use(cors());
app.use(express.json());

app.post('/deploy', async (req: Request, res: Response) => {
  const repoUrl: string = req.body.repourl;
  const id: string = generateId();
  await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));
  let files = getAllFiles(path.join(__dirname, `output/${id}`));
  console.log(__dirname)
  files.forEach(async (file) => {

    files.forEach(async file => {
      await uploadFile(file.slice(__dirname.length + 1), file);
    })
  })
  redis.on("error", (err) => console.error("Redis Client Error", err));

  await redis.connect(); // Important: Connect before using Redis

  await redis.lPush("build-queue", id);

  res.json({ id, repoUrl });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});