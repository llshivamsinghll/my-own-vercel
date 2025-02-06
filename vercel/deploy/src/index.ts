import { createClient } from 'redis';
import { copyFinalDist,listAndDownload } from './aws';
import { buildProject } from './utils';

const subscriber = createClient();

async function main() {
  await subscriber.connect();

  while (true) {
    const res = await subscriber.brPop('build-queue', 0);
    if (res) {
      console.log('Received:', res);
      const id = res.element

      const bucketName = "my-own-vercel";
      const prefix = `output/${id}/`;

      await listAndDownload(bucketName, prefix)
      .then(objects => console.log("Objects:", objects))
    .catch(error => console.error("Error:", error));
    await buildProject(id);
        copyFinalDist(id);



    }
  }
}

main();