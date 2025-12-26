import { Interaction, MessageFlags } from "discord.js";

const missingPermissions = (interaction: Interaction) => {
  if (interaction.isRepliable()) {
    const message = `Vous n'avez actuellement pas les permissions nécessaires pour exécuter cette commande.`;
    try {
      interaction.reply({
        content: message,
        flags: MessageFlags.Ephemeral,
      });
    } catch {
      interaction.editReply({
        content: message,
      });
    }
  }
};

export { missingPermissions };
