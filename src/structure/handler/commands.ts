import { type Client, Events, MessageFlags } from "discord.js";
import { callLogout } from "../../events/logout";
import { userClients } from "../initalization";
import { cooldown, usersCooldown } from "../util/functions/cooldown";
import db from "../util/lib/database";

const commandHandler = (client: Client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    // If the interaction isn't a command do nothing
    if (!interaction.isCommand()) return;
    const users = userClients;

    // Check if the user is currently logged
    const user = await db.user.findUnique({
      where: {
        id: interaction.user.id,
      },
    });

    if (!user) {
      interaction.reply({
        content:
          "`❌` Vous devez être connecté a ShadowSB pour utiliser cette commande.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Find the corresponding user from the users array
    const correspondingUser = users.find((u) => u.user?.id === user.id);
    if (!correspondingUser) return;

    const { commandName } = interaction;

    // Execute the command
    try {
      correspondingUser.isReady();
      const afk = await db.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          isAfk: true,
        },
      });

      if (afk?.isAfk) {
        await db.user.update({
          where: {
            id: user.id,
          },
          data: {
            isAfk: false,
          },
        });
      }

      if (usersCooldown.includes(user.id)) {
        interaction.reply({
          content: `\`🚫\` Veuillez attendre \`8\` secondes de plus avant de réessayer !`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      cooldown(user.id);

      // @ts-ignore
      const sub = interaction.options.getSubcommand();
      if (sub != "dmfriends" && sub != "say") {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      }

      const command = await import(`../../commands/${commandName}`);
      command.execute(client, correspondingUser, interaction);
    } catch {
      await callLogout(client, correspondingUser.token!);
    }
  });

  return;
};

export default commandHandler as typeof commandHandler;
