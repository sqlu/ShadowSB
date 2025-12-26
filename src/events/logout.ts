import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  userMention,
  type Client,
} from "discord.js";
import db from "../structure/util/lib/database";

const callLogout = async (client: Client, token: string) => {
  const channel = await client.channels.fetch(process.env.LOG_CHANNEL_ID!);

  if (!channel) {
    console.error("Log channel unreachable.");
    process.exit(1);
  }

  const user = await db.user.findUnique({
    where: { token },
    select: { id: true, username: true },
  });

  if (!user) {
    console.error("User not found.");
    return;
  }

  const { username, id: userId } = user;

  console.log(`[-] - ${username} disconnected from ShadowSB.`);

  const logoutEmbed = new EmbedBuilder()
    .setTitle(`\`❌\` ▸ Déconnexion`)
    .setDescription(
      `> ${userMention(
        userId
      )} a été déconnecté de ShadowSB. J'ai envoyé un message à l'utilisateur !` +
        `> **ID Utilisateur:** \`${userId}\``
    )
    .setColor("Red");

  if (channel.isTextBased() && channel.type === ChannelType.DM) {
    await channel.send({ embeds: [logoutEmbed] });
  }

  try {
    const user = await client.users.fetch(userId);

    const userSendedEmbed = new EmbedBuilder()
      .setTitle(`\`❌\` ▸ Déconnecté de Self`)
      .setDescription(
        `> Votre **token a été __changé__**. Veuillez vous reconnecter à ShadowSB. Vous pouvez le faire en cliquant sur le bouton ci-dessous.`
      )
      .setColor("Red");

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("login")
        .setStyle(ButtonStyle.Primary)
        .setLabel("▸ Se connecter"),
      new ButtonBuilder()
        .setCustomId("tokenhelp")
        .setStyle(ButtonStyle.Secondary)
        .setLabel("▸ Comment obtenir mon token ?")
    );

    await user.send({ embeds: [userSendedEmbed], components: [row] });
  } catch (error) {
    console.error("Failed to send message to user:", error);
  }

  try {
    await db.user.delete({ where: { token } });
  } catch (error) {
    console.error("Failed to delete user from database:", error);
  }
};

export { callLogout };
