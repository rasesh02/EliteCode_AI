import {createClient} from "redis"
import {v4} from "uuid"

class RedisManager{

    static instance= null;
    publisher=null;
    subscriber=null;
    //constructor to assign values
    constructor(){
       this.publisher=createClient({ url: "redis://redis_server:6379"});
       this.subscriber=createClient({ url: "redis://redis_server:6379"});
    }
    // to perform async tasks
     async init() {
    try {
      await this.publisher.connect();
      console.log("publisher connected");
      await this.subscriber.connect();
      console.log("subscriber connected");
    } catch (err) {
      if (err.code === "ERR_CONNECTING" || err.message.includes("connection is already")) {
        // Ignore duplicate connect attempts
        console.log("Redis already connected");
      } else {
        throw err;
      }
    }
  }


    static async getInstance(){
        if(!RedisManager.instance){
            const manager=new RedisManager();
            await manager.init();
            RedisManager.instance=manager;

        }
        return RedisManager.instance;
    }

    async pushToQueue(job){
        try{
        if(!job){
          console.error("no job to send to worker");
          return;
        }
       const job_id=v4();
       const executeableJob={...job,job_id};
      // console.log(executeableJob);

       const cleanup=async()=>{
        try {
           await this.subscriber.unsubscribe(job_id);
        } catch (error) {
          console.log("error while unsubcribing ", error);
        }
       }
       if(this.publisher.isOpen){

       return new Promise(async (resolve,reject)=>{

        this.subscriber.subscribe(`${job_id}`,(message)=>{
         try {
          console.log(`Subscribe received the message : ${message}`);
          resolve(JSON.parse(message));
         } catch (error) {
           console.error("Error parsing response:", error);
           reject(error);
         }
         finally{
           cleanup();
         }
       });
       const pushedJob=await this.publisher.lPush("problems",JSON.stringify(executeableJob));
       console.log(`job ${job_id} pushed to queue : `,pushedJob);
       })
    }
  }
    catch(error){
    console.error("could not push to redis, error : ", error);
    }
    }

};

export default RedisManager;