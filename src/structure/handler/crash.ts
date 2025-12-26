import { ChannelType, EmbedBuilder, type Client } from "discord.js";

const crashHandler = async (client: Client) => {
  const sendErrorToChannel = async (message: string) => {
    const errorChannel = await client.channels.fetch(
      process.env.LOG_CHANNEL_ID!
    );

    if (!errorChannel || errorChannel!.type != ChannelType.GuildText) {
      console.error("Log latence channel unreachable or no voice based.");
      process.exit(1);
    }

    const embed = new EmbedBuilder()
      .setDescription(`\`\`\`\n${message}\n\`\`\``)
      .setColor("Red")
      .setTitle("`❗` ▸ Erreur");
    if (errorChannel.isSendable()) {
      await errorChannel.send({ embeds: [embed] });
    }
  };

  client.on("error", (error: Error) => {
    console.error(error);
    sendErrorToChannel(error.stack ?? error.message);
  });

  process.on("uncaughtExceptionMonitor", (error: Error) => {
    console.error(error);
    sendErrorToChannel(error.stack ?? error.message);
  });

  process.on("rejectionHandled", (error: Error) => {
    console.error(error);
    sendErrorToChannel(error.stack ?? error.message);
  });

  process.on("warning", (error: Error) => {
    console.error(error);
    sendErrorToChannel(error.stack ?? error.message);
  });

  process.on("uncaughtException", (error: Error) => {
    console.error(error);
    sendErrorToChannel(error.stack ?? error.message);
  });

  process.on("unhandledRejection", (error: Error) => {
    console.error(error);
    sendErrorToChannel(error.stack ?? error.message);
  });

  process.on("processTicksAndRejections", (_request, error: Error) => {
    console.error(error);
    sendErrorToChannel(error.stack ?? error.message);
  });

  process.on("uncaughtException", (error: Error) => {
    console.error(error);
    sendErrorToChannel(error.stack ?? error.message);
  });
};

export default crashHandler as typeof crashHandler;
