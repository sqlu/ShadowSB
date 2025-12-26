import { DMChannel, userMention, type Client } from "discord.js";
import { Client as User } from "discord.js-selfbot-v13";
import { sendLog } from "../structure/util/functions/sendLog";
import db from "../structure/util/lib/database";

const callMessageCreate = async (client: Client, user: User) => {
  user.on("messageCreate", async (message) => {
    const state = await db.user.findUnique({
      where: {
        id: user.user!.id,
      },
      select: {
        isAfk: true,
        antipubmp: true,
        antiping: true,
      },
    });

    if (state?.isAfk) {
      if (
        message.author.id !== user.user!.id &&
        message.content.includes(user.user!.id)
      ) {
        await message.reply("Sorry I'm currently AFK, consider tag me later.");
        sendLog(
          user,
          `${userMention(message.author!.id)} tagged you were AFK.`
        );
      }
    }

    if (state?.antipubmp) {
      if (
        message.channel instanceof DMChannel &&
        message.content.includes("discord.gg/")
      ) {
        const dmChannel = message.channel as DMChannel;
        await dmChannel.send("-# __*ShadowSB - AntiPubMp enable.*__");

        await dmChannel.delete();
        return;
      }
    }

    if (
      state?.antiping &&
      (message.content.includes(userMention(user.user!.id)) ||
        message.content.includes("@everyone") ||
        message.content.includes(userMention("@here")))
    ) {
      message.channel.lastMessage?.markRead;
    }
  });

  return;
};

export { callMessageCreate };
