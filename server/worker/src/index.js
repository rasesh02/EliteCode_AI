import {createClient} from "redis"
import { CppTestRunner } from "./cpp_runner.js";


const worker=async()=>{
    const cppRunner=new CppTestRunner();
    try {
        const redisClient= createClient({ url: "redis://redis_server:6379"});
        await redisClient.connect();
        while(true){
            const codeSnippet=await redisClient.brPop("problems",0);
            if(!codeSnippet) continue;

            const job=JSON.parse(codeSnippet.element);
            console.log(`${job} removed from queue`);
            const language=job.language;

            switch (language) {
                case "C++":
                    const cppRes=await cppRunner.execute(job);
                    console.log("processed by worker");
                    await redisClient.publish(`${job.job_id}`,JSON.stringify(cppRes));
                    console.log("pushed to pub sub",cppRes);
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