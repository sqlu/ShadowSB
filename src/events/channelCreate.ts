import type { Client } from "discord.js";
import {
  Channel,
  DMChannel,
  GroupDMChannel,
  type Client as User,
} from "discord.js-selfbot-v13";
import { sendLog } from "../structure/util/functions/sendLog";
import db from "../structure/util/lib/database";

const callchannelCreate = async (client: Client, user: User) => {
  user.on("channelCreate", async (channel: Channel) => {
    const state = await db.user.findUnique({
      where: {
        id: user.user!.id,
      },
      select: {
        antigroup: true,
        antimp: true,
      },
    });

    if (!state) return;

    if (channel instanceof GroupDMChannel && state.antigroup) {
      await channel.send("-# __*ShadowSB - AntiGroupe activé.*__");

      sendLog(user, `You've had left ${channel.name} group.`);

      await channel.delete();
      return;
    }

    if (channel instanceof DMChannel && state.antimp) {
      await channel.send("-# __*ShadowSB - AntiMP activé.*__");

      await channel.delete();
      return;
    }
  });
};

export { callchannelCreate };
