import {
  ActionRowBuilder,
  ButtonInteraction,
  Client,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { Client as User } from "discord.js-selfbot-v13";
import { version } from "../../../package.json";
import { callLogin } from "../../events/login";
import { userClients } from "../../structure/initalization";
import db from "../../structure/util/lib/database";

const execute = async (client: Client, interaction: ButtonInteraction) => {
  const dbUser = await db.user.findUnique({
    where: {
      id: interaction.user!.id!,
    },
  });

  if (dbUser) {
    await interaction.deferReply({flags: MessageFlags.Ephemeral});
    await interaction.editReply({ content: "Vous êtes déjà connecté à ShadowSB" });
    return;
  }

  const modal = new ModalBuilder()
    .setCustomId("login")
    .setTitle("▸ Connexion Shadow");

  const tokenInput = new TextInputBuilder()
    .setCustomId("token")
    .setLabel("Collez votre token Discord ici")
    .setRequired(true)
    .setPlaceholder("Pour plus d'aide, utilisez le deuxième bouton !")
    .setStyle(TextInputStyle.Short);

  const row = new ActionRowBuilder<TextInputBuilder>().addComponents(tokenInput);
  modal.addComponents(row);

  await interaction.showModal(modal);

  const submitted = await interaction.awaitModalSubmit({ time: 1200000 }).catch(() => null);

  if (submitted) {
    await submitted.deferReply({ flags: MessageFlags.Ephemeral });

    const token = submitted.fields.getTextInputValue("token");
    const user = new User();
    const startTime = Date.now();

    try {
      await user.login(token);
    } catch {
      await submitted.editReply({ content: "Ce token Discord est invalide, veuillez utiliser un token Discord valide." });
      return;
    }

    const elapsedTime = Date.now() - startTime;

    if (user.user!.id !== submitted.user.id) {
      await submitted.editReply({ content: "Ce token Discord n'est pas le vôtre, veuillez vous connecter avec votre propre token Discord." });
      user.destroy();
      return;
    }

    const group = await user.channels.createGroupDM();

    await db.user.create({
      data: {
        username: user.user!.username,
        groupId: group.id,
        token: token,
        id: user.user?.id!,
      },
    });

    await submitted.editReply({ content: `\`✅\` Félicitations 🎉! Retrouvez toutes les informations pour utiliser le selfbot dans <#${group.id}>.` });

    await group.setName(`${client.user?.username} ${version}`);
    await group.setIcon(client.user?.avatarURL({ extension: "png" }) as string);

    await group.send(
      "# **Bienvenue sur Shadow!**  💫\n\n" +
      "> Si vous **ne voyez pas de commandes apparaître** en tapant `/`, rafraîchissez simplement votre client Discord en appuyant sur `Ctrl + R`.\n\n" +
      "-# - **Note Importante**: La __version BETA__ est actuellement disponible pour aider à identifier les bugs potentiels dans les commandes. Cela nous permet de prévenir les erreurs et de vous offrir la meilleure expérience possible. N'hésitez pas à partager vos retours avec nous sur <#1334236914714415215> !  💫"
    ).then(async (msg) => {
      await msg.react("💫");
      await msg.pin();
      await msg.markUnread();
    });

    userClients.push(user);
    await user.installUserApps(client.user!.id);
    callLogin(client, user, elapsedTime);
  }

  return;
};

export { execute };
