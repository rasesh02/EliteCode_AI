import {createClient} from "redis"
import { CppTestRunner } from "./cpp_runner.js";
import { PythonTestRunner } from "./python_runner.js";
import { JsTestRunner } from "./js_runner.js";
import { JavaTestRunner } from "./java_runner.js";


const worker=async()=>{
    const cppRunner=new CppTestRunner();
    const pyRunner = new PythonTestRunner();
    const jsRunner = new JsTestRunner();
    const javaRunner = new JavaTestRunner();
    try {
        const redisClient= createClient({ url: "redis://redis_server:6379"});
        await redisClient.connect();
        while(true){
            const codeSnippet=await redisClient.brPop("problems",0);
            if(!codeSnippet) continue;

            const job=JSON.parse(codeSnippet.element);
            console.log(`${job.job_id} removed from queue`);
            const language=job.language;

            switch (language) {
                case "C++":
                    const cppRes=await cppRunner.execute(job);
                    console.log("processed by worker");
                    await redisClient.publish(`${job.job_id}`,JSON.stringify(cppRes));
                    console.log("pushed to pub sub",cppRes);
                    break;
                    
                case "Python":
                    const pyResult = await pyRunner.execute(job);
                    console.log("pyResult", pyResult);
                    await redisClient.publish(`${job.job_id}`, JSON.stringify(pyResult));
                    console.log(`Completed job ${job.job_id}`);
                    break;

                case "Java":
                    const javaResult = await javaRunner.execute(job);
                    console.log("java results", javaResult);
                    await redisClient.publish(
                    `${job.job_id}`,
                    JSON.stringify(javaResult)
                    );
                    break;

                case "Javascript":
                const jsResult = await jsRunner.execute(job);
                await redisClient.lPush(
                    `results:${job.job_id}`,
                    JSON.stringify(jsResult)
                );
                console.log(`Completed job ${job.job_id}`);
                break;
                
            
                default:
                    break;
            }
        }
    } catch (error) {
       console.error("Worker error:", error);
       process.exit(1);
    }
}
worker()