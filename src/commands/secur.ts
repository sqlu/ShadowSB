import { type ChatInputCommandInteraction, type Client } from "discord.js";
import { type Client as User } from "discord.js-selfbot-v13";
import db from "../structure/util/lib/database";

const props = {
  name: "secur",
  description: "Commandes liées à la sécurité du client Discord",
  type: 1,
  integration_types: [1],
  contexts: [0, 1, 2],
  options: [
    {
      name: "antimute",
      description: "Permet d'activer ou de désactiver le système AntiMute.",
      type: 1,
      options: [
        {
          name: "state",
          description: "L'état que vous souhaitez définir pour le système AntiMute.",
          type: 3,
          choices: [
            { name: "activer", value: "on" },
            { name: "désactiver", value: "off" },
          ],
          required: true,
        },
      ],
    },
    {
      name: "antimp",
      description: "Permet d'activer ou de désactiver le système AntiMp.",
      type: 1,
      options: [
        {
          name: "state",
          description: "L'état que vous souhaitez définir pour le système AntiMp.",
          type: 3,
          choices: [
            { name: "activer", value: "on" },
            { name: "désactiver", value: "off" },
          ],
          required: true,
        },
      ],
    },
    {
      name: "antipubmp",
      description: "Permet d'activer ou de désactiver le système AntiPubMp.",
      type: 1,
      options: [
        {
          name: "state",
          description: "L'état que vous souhaitez définir pour le système AntiPubMp.",
          type: 3,
          choices: [
            { name: "activer", value: "on" },
            { name: "désactiver", value: "off" },
          ],
          required: true,
        },
      ],
    },
    {
      name: "antigroup",
      description: "Permet d'activer ou de désactiver le système AntiGroup.",
      type: 1,
      options: [
        {
          name: "state",
          description: "L'état que vous souhaitez définir pour le système AntiGroup.",
          type: 3,
          choices: [
            { name: "activer", value: "on" },
            { name: "désactiver", value: "off" },
          ],
          required: true,
        },
      ],
    },
    {
      name: "antighostping",
      description: "Permet d'activer ou de désactiver le système AntiGhostPing.",
      type: 1,
      options: [
        {
          name: "state",
          description: "L'état que vous souhaitez définir pour le système AntiGhostPing.",
          type: 3,
          choices: [
            { name: "activer", value: "on" },
            { name: "désactiver", value: "off" },
          ],
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
  const state = interaction.options.getString("state") === "on";

  const updateData = async (field: string) => {
    await db.user.update({
      where: { id: user.user!.id },
      data: { [field]: state },
    });

    await interaction.editReply({
      content: `Le système ${field} est maintenant ${state ? "`activer`" : "`désactiver`"}.`,
    });
  };

  switch (subCommand) {
    case "antimute":
      await updateData("antimute");
      break;
    case "antimp":
      await updateData("antimp");
      break;
    case "antipubmp":
      await updateData("antipubmp");
      break;
    case "antigroup":
      await updateData("antigroup");
      break;
    case "antighostping":
      await updateData("antighostping");
      break;
    default:
      break;
  }
};

export { execute, props };
