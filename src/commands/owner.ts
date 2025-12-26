import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  EmbedBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import { type Client as User } from "discord.js-selfbot-v13";
import db from "../structure/util/lib/database";

const props = {
  name: "owner",
  description: "Commandes liées aux owners",
  type: 1,
  options: [
    {
      name: "userlist",
      description: "Permet de voir tous les utilisateurs du sb.",
      type: 1,
    },
    {
      name: "restart",
      description: "Permet de relancer le système.",
      type: 1,
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
    case "userlist":
      const users = await db.user.findMany();
      const itemsPerPage = 15;
      let currentPage = 0;
      const totalPages = Math.ceil(users.length / itemsPerPage);

      const generateEmbed = (page: number) => {
        const start = page * itemsPerPage;
        const end = start + itemsPerPage;
        const userList = users.slice(start, end);

        return new EmbedBuilder()
          .setTitle(`\`👤\` ▸ Liste des utilisateurs`)
          .setDescription(
            userList
              .map(
                async (user: any, i: number) =>
                  `> ${start + i + 1}. **\`${user.username}\`** (\`${
                    user.id
                  }\`)`
              )
              .join("\n")
          )
          .setColor("#2b2d31")
          .setFooter({ text: `Page ${page + 1} sur ${totalPages}` });
      };

      const embed = generateEmbed(currentPage);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("previous")
          .setLabel("▸ Précédent")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === 0),
        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("▸ Suivant")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === totalPages - 1)
      );

      const message = await interaction.editReply({
        embeds: [embed],
        components: [row],
      });

      const filter: any = (i: any) => i.user.id === interaction.user.id;
      const collector = message.createMessageComponentCollector({
        filter,
        time: 60000,
      });

      collector.on("collect", async (i) => {
        if (i.customId === "previous") {
          currentPage--;
        } else if (i.customId === "next") {
          currentPage++;
        }

        const newEmbed = generateEmbed(currentPage);
        const newRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("previous")
            .setLabel("▸ Précédent")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage === 0),
          new ButtonBuilder()
            .setCustomId("next")
            .setLabel("▸ Suivant")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage === totalPages - 1)
        );

        await i.update({ embeds: [newEmbed], components: [newRow] });
      });

      collector.on("end", async () => {
        if (message.channel) {
          await message.edit({ components: [] });
        }
        return;
      });

      break;

    case "restart":
      await interaction.editReply({
        content: `Le système va redémarrer..`,
      });
      process.exit(0);
      break;

    default:
      await interaction.editReply({
        content: "Commande inconnue.",
      });
      break;
  }
};

export { execute, props };
