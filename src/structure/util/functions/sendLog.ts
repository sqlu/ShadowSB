import { Client as User } from "discord.js-selfbot-v13";
import db from "../lib/database";

const sendLog = async (user: User, message: string) => {
  try {
    const groupId = await db.user.findUnique({
      where: {
        id: user.user!.id,
      },
      select: {
        groupId: true,
      },
    });

    const group = user.channels.cache.get(groupId!.groupId);

    if (group?.type !== "GROUP_DM") return;

    await group?.send(message).then((msg) => {
      msg.markUnread();
    });
  } catch {}
};

export { sendLog };
