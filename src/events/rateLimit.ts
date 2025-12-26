import type { Client } from "discord.js";
import {
  Channel,
  DMChannel,
  GroupDMChannel,
  type Client as User,
} from "discord.js-selfbot-v13";
import { sendLog } from "../structure/util/functions/sendLog";
import db from "../structure/util/lib/database";

interface RateLimitInfo {
  timeout: number;
  limit: number;
  method: string;
  path: string;
  route: string;
  global: boolean;
}

declare module 'discord.js-selfbot-v13' {
    interface Client {
        rateTimeout: NodeJS.Timeout | null;
    }
}
const callRateLimit = async (client: Client, user: User<true>) => {
  user.on("rateLimit", async (rate: RateLimitInfo) => {
    const token = await db.user.findUnique({
        where: {
            id: user.user!.id,
        },
        select: {
            token: true,
        }
    })
    
    if (rate.global) {
      console.log(user.user.tag, 'destroyed')

      user.destroy();
       user.rateTimeout = setTimeout(() => {
        console.log(token)
        user.login(String(token!.token))
       }, rate.timeout);
    }

  });
};

export { callRateLimit };
