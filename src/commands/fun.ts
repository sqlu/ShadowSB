import { type ChatInputCommandInteraction, type Client } from "discord.js";
import { type Client as User } from "discord.js-selfbot-v13";

const props = {
  name: "fun",
  description: "Commandes liées au divertissement",
  type: 1,
  options: [
    {
      name: "say",
      description: "Permet d'envoyer un message via le bot.",
      type: 1,
      options: [
        {
          name: "message",
          description: "Le message que vous souhaitez envoyer via le bot.",
          type: 3,
          required: true,
        },
      ],
    },
    {
      name: "coinflip",
      description: "Lance une pièce et retourne soit Pile soit Face.",
      type: 1,
    },
    {
      name: "random",
      type: 1,
      description:
        "Affiche un nombre aléatoire entre un minimum et un maximum.",
      options: [
        {
          name: "min",
          type: 4,
          description: "Le minimum du nombre aléatoire.",
          required: true,
        },
        {
          name: "max",
          type: 4,
          description: "Le maximum du nombre aléatoire.",
          required: true,
        },
      ],
    },
  ],
};

const execute = async (
  client: Client,
  user: User,
  interaction: ChatInputCommandInteraction
) => {
  const subCommand = interaction.options.getSubcommand();

  switch (subCommand) {
    case "say":
      const text = interaction.options.getString("message")!;
      await interaction.reply({ content: text });
      break;

    case "random":
      const max = interaction.options.getInteger("max")!;
      const min = interaction.options.getInteger("min")!;

      if (min > max) {
        await interaction.editReply({
          content: `L'option \`min\` doit être inférieure à l'option \`max\`.`,
        });
        return;
      }

      const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
      await interaction.editReply({
        content: `**${randomNumber}** !`,
      });
      break;

    case "coinflip":
      const result = Math.random() < 0.5 ? "Pile" : "Face";
      await interaction.editReply({
        content: `**${result}** !`,
      });
      break;

    default:
      await interaction.editReply({
        content: "Commande inconnue.",
      });
      break;
  }
};

export { execute, props };
