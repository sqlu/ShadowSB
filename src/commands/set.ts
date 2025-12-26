import { type ChatInputCommandInteraction, type Client } from "discord.js";
import {
  ActivityType,
  RichPresence,
  type Client as User,
} from "discord.js-selfbot-v13";
import db from "../structure/util/lib/database";

const props = {
  name: "set",
  description: "Commandes liées au setters Discord",
  type: 1,
  integration_types: [1],
  contexts: [0, 1, 2],
  options: [
    {
      name: "theme",
      description: "Permet de changer votre thème Discord.",
      type: 1,
      options: [
        {
          name: "accent",
          description: "Le thème que vous souhaitez définir.",
          type: 3,
          choices: [
            { name: "sombre", value: "dark" },
            { name: "clair", value: "light" },
          ],
          required: true,
        },
      ],
    },
    {
      name: "developer",
      description: "Permet d'activer ou de désactiver le mode développeur.",
      type: 1,
      options: [
        {
          name: "state",
          description:
            "L'état que vous souhaitez définir pour le mode développeur.",
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
      name: "afk",
      description: "Permet d'activer ou de désactiver le mode afk.",
      type: 1,
      options: [
        {
          name: "state",
          description: "L'état que vous souhaitez définir pour le mode afk.",
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
      name: "antiping",
      description: "Permet d'activer ou de désactiver le mode AntiPing.",
      type: 1,
      options: [
        {
          name: "state",
          description:
            "L'état que vous souhaitez définir pour le mode AntiPing.",
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
      name: "richpresence",
      description: "Personnalisez votre rich presence",
      type: 1,
      options: [
        {
          name: "type",
          description: "Le type d'activité",
          type: 3,
          required: true,
          choices: [
            { name: "Jouer", value: "PLAYING" },
            { name: "Stream", value: "STREAMING" },
            { name: "Écouter", value: "LISTENING" },
            { name: "Regarder", value: "WATCHING" },
            { name: "Participe", value: "COMPETING" },
          ],
        },
        {
          name: "name",
          description: "Nom de l'activité",
          type: 3,
          required: true,
        },
        {
          name: "details",
          description: "Texte des détails",
          type: 3,
          required: false,
        },
        {
          name: "state",
          description: "Texte de l'état",
          type: 3,
          required: false,
        },
        {
          name: "largeimage",
          description: "URL pour la grande image",
          type: 3,
          required: false,
        },
        {
          name: "smallimage",
          description: "URL pour la petite image",
          type: 3,
          required: false,
        },
        {
          name: "largetext",
          description: "Texte affiché en survolant la grande image",
          type: 3,
          required: false,
        },
        {
          name: "smalltext",
          description: "Texte affiché en survolant la petite image",
          type: 3,
          required: false,
        },
        {
          name: "button1text",
          description: "Texte pour le premier bouton",
          type: 3,
          required: false,
        },
        {
          name: "button1url",
          description: "URL pour le premier bouton",
          type: 3,
          required: false,
        },
        {
          name: "button2text",
          description: "Texte pour le deuxième bouton",
          type: 3,
          required: false,
        },
        {
          name: "button2url",
          description: "URL pour le deuxième bouton",
          type: 3,
          required: false,
        },
      ],
    },
    {
      name: "status",
      description: "Définir votre statut en ligne",
      type: 1,
      options: [
        {
          name: "type",
          description: "Type de statut",
          type: 3,
          required: true,
          choices: [
            { name: "En ligne", value: "online" },
            { name: "Absent", value: "idle" },
            { name: "Ne pas déranger", value: "dnd" },
            { name: "Invisible", value: "invisible" },
          ],
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
    case "theme":
      await user.settings.setTheme(
        interaction.options.getString("accent") as "dark" | "light"
      );
      await interaction.editReply({
        content: `Votre thème est maintenant \`${interaction.options.getString(
          "accent"
        )}\`.`,
      });
      break;

    case "developer":
      user.settings.developerMode =
        interaction.options.getString("state") === "on";

      await interaction.editReply({
        content: `Votre mode développeur est maintenant ${
          interaction.options.getString("state") === "on"
            ? "`activer`"
            : "`désactiver`"
        }.`,
      });
      break;

    case "afk":
    case "antiping":
      const isAfk = interaction.options.getString("state") === "on";
      await db.user.update({
        where: { id: user.user!.id },
        data: { isAfk },
      });

      await interaction.editReply({
        content: `Le mode ${subCommand} est maintenant ${
          isAfk ? "`activer`" : "`désactiver`"
        }.`,
      });
      break;

    case "richpresence":
      const type = interaction.options.getString("type")!;
      const name = interaction.options.getString("name")!;
      const details = interaction.options.getString("details");
      const state = interaction.options.getString("state");
      const largeImage = interaction.options.getString("largeimage");
      const smallImage = interaction.options.getString("smallimage");
      const largeText = interaction.options.getString("largetext");
      const smallText = interaction.options.getString("smalltext");
      const button1Text = interaction.options.getString("button1text");
      const button1URL = interaction.options.getString("button1url");
      const button2Text = interaction.options.getString("button2text");
      const button2URL = interaction.options.getString("button2url");

      const rpc = new RichPresence(user)
        .setType(type as ActivityType)
        .setName(name)
        .setURL("https://www.twitch.tv/aquinasctf");

      if (details) rpc.setDetails(details);
      if (state) rpc.setState(state);
      if (largeImage) rpc.setAssetsLargeImage(largeImage);
      if (smallImage) rpc.setAssetsSmallImage(smallImage);
      if (largeText) rpc.setAssetsLargeText(largeText);
      if (smallText) rpc.setAssetsSmallText(smallText);

      if (button1Text && button1URL) {
        rpc.addButton(button1Text, button1URL);
      }
      if (button2Text && button2URL) {
        rpc.addButton(button2Text, button2URL);
      }

      user.user!.setPresence({ activities: [rpc] });

      await interaction.editReply({
        content: "Rich presence mise à jour avec succès !",
      });
      break;

    case "status":
      const statusType = interaction.options.getString("type")!;
      user.user!.setStatus(
        statusType as "online" | "idle" | "dnd" | "invisible"
      );

      await interaction.editReply({
        content: `Ton status est maintenant \`${statusType}\` !`,
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
