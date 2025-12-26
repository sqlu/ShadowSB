import {
  AnySelectMenuInteraction,
  Client,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";

const execute = async (
  client: Client,
  interaction: AnySelectMenuInteraction
) => {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const embed = new EmbedBuilder()
    .setTimestamp()
    .setThumbnail(interaction.user.displayAvatarURL())
    .setColor("Red");

  if (interaction.values[0] === "pc") {
    embed
      .setTitle("`❓` ▸ Comment récupérer son token sur pc ?")
      .setDescription(
        "> *Pour réaliser cette manipulation, vous devrez posséder un pc & un navigateur.*\n\n" +
          "> - 1. Connectez-vous à votre compte [discord](https://discord.com/login) sur votre navigateur (de préférence __Google__)\n\n" +
          "> - 2. Une fois connecté faites `ctrl + maj + i` ou `F12` et allez dans l'onglet `Console`\n\n" +
          "- Une fois dans l'onglet `Console`, ne faites pas attention aux messages et collez ce code : \n```js\n" +
          "window.webpackChunkdiscord_app.push([[Math.random()],{},req => {if (!req.c) return;for (const m of Object.keys(req.c).map(x => req.c[x].exports).filter(x => x)) {if (m.default && m.default.getToken !== undefined) {return copy(m.default.getToken());}if (m.getToken !== undefined) {return copy(m.getToken());}}},]);console.log('%cWorked!', 'font-size: 50px');console.log(`%cYou now have your token in the clipboard!`, 'font-size: 16px');\n```\n\n" +
          "> - 3. Vous aurez maintenant votre token copié dans votre __*presse-papiers*__ !"
      );
  } else if (interaction.values[0] === "mobile") {
    embed
      .setTitle("`❓` ▸ Comment récupérer son token sur mobile ?")
      .setDescription(
        "> *Pour réaliser cette manipulation, vous devrez posséder un téléphone & un navigateur.*\n\n" +
          "> - 1. Connectez-vous à votre compte [discord](https://discord.com/login) sur votre navigateur (de préférence __Google__)\n\n" +
          "> - 2. Collez dans la barre de recherche ce script :\n```js\n" +
          "javascript:(async()%20%3D%3E%20%7B%20const%20token%20%3D%20(webpackChunkdiscord_app.push(%5B%5B''%5D%2C%7B%7D%2Ce%3D%3E%7Bm%3D%5B%5D%3Bfor(let%20c%20in%20e.c)m.push(e.c%5Bc%5D)%7D%5D)%2Cm).find(m%3D%3Em%3F.exports%3F.default%3F.getToken!%3D%3Dvoid%200).exports.default.getToken()%3Bwindow.location.href%20%3D%20%60https%3A%2F%2Fwww.google.com%2Fsearch%3Fq%3Dton%2Btoken%2Best%2B%24%7Btoken%7D%60%3B%7D)()\n```\n" +
          "> - 3. **N'oubliez pas de rajouter le javascript: au début du script.**\n\n" +
          "> - 4. Vous allez être **redirigé sur une page avec votre token** !"
      );
  }

  await interaction.editReply({ embeds: [embed] });
};

export { execute };
