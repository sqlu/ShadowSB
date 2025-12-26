import { type Client, Events, MessageFlags } from "discord.js";
import { userClients } from "../initalization";
import { cooldown, usersCooldown } from "../util/functions/cooldown";
import db from "../util/lib/database";

const selectHandler = (client: Client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    // If the interaction isn't a select do nothing
    if (!interaction.isAnySelectMenu()) return;

    // Check if the user is currently logged
    if (interaction.customId != "gettoken") {
      const user = await db.user.findUnique({
        where: {
          id: interaction.user.id,
        },
      });

      if (!user) {
        interaction.reply({
          content:
            "`❌` Vous devez être connecté a ShadowSB pour utiliser ce menu.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      // Find the corresponding user from the users array
      const correspondingUser = userClients.find((u) => u.user?.id === user.id);
      if (!correspondingUser) return;

      if (usersCooldown.includes(user.id)) {
        interaction.reply({
          content: `\`🚫\` Veuillez attendre \`8\` secondes de plus avant de réessayer !`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      cooldown(user.id);

      // Execute the interaction
      const select = await import(
        `../../interactions/selects/${interaction.customId}`
      );
      select.execute(client, correspondingUser, interaction);
    } else {
      // Execute the interaction
      const select = await import(
        `../../interactions/selects/${interaction.customId}`
      );
      select.execute(client, interaction);
    }
  });

  return;
};

export default selectHandler as typeof selectHandler;
