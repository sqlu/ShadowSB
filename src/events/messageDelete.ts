import { userMention, type Client } from "discord.js";
import { Client as User } from "discord.js-selfbot-v13";
import { sendLog } from "../structure/util/functions/sendLog";
import db from "../structure/util/lib/database";

const callMessageDelete = async (client: Client, user: User) => {
  user.on("messageDelete", async (message) => {
    if (!message.author || message.author.id === user.user!.id || message.author.bot) return;

    const state = await db.user.findUnique({
      where: { id: user.user!.id },
      select: { antighostping: true },
    });

    if (state?.antighostping && message.content?.includes(userMention(user.user!.id))) {
      sendLog(user, `${userMention(message.author.id)} vous a ghost ping dans ${message.channel}.`);
    }

    let content = message.content || "Pas de contenu";
    if (message.attachments.size > 0) {
      content = "Image(s) supprimée(s)";
    } else if (message.stickers.size > 0) {
      content = "Sticker supprimé";
    }

    const snipes = await db.snipe.count();
    if (snipes > 300) {
      await db.snipe.deleteMany();
    }

    try {
      await db.snipe.create({
        data: {
          content: content,
          channelId: message.channel.id,
          authorId: message.author.id,
          sendAt: `<t:${Math.floor(Date.now() / 1000)}:R>`,
        },
      });
    } catch {
      await db.snipe.update({
        where: { channelId: message.channel.id },
        data: {
          content: content,
          authorId: message.author.id,
          sendAt: `<t:${Math.floor(message.createdTimestamp / 1000)}:R>`,
        },
      }).catch(() => {});
    }
  });
};

export { callMessageDelete };
