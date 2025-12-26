import { ChannelType, Client } from "discord.js";
import { config as env } from "dotenv";
import fnIndex from "./structure";
import configChannelsType from "./structure/util/types/configChannelsType";
env();
// Please read the README file before changing anything

// Create the main discord bot
const client: Client = new Client({
  intents: Array(),
  /*
   * The client normally don't need any intents
   * If you need some intents you can put them by replacing "Array()" by a list
   * You can find intents at https://guide.discordjs.dev/guide/topics/intents
   */
});

// Define the bot channels configuration
export let channels: configChannelsType = {
  log_channel: null,
  latence_channel: null,
  login_channel: null,
  users_nb_channel: null,
  support_channel: null,
};

// Use async function to avoid timing errors
const run = async () => {
  await client.login(process.env.APPLICATION_TOKEN);

  channels.log_channel = await client.channels.fetch(
    process.env.LOG_CHANNEL_ID!
  );

  channels.latence_channel = await client.channels.fetch(
    process.env.LATENCE_CHANNEL_ID!
  );

  channels.login_channel = await client.channels.fetch(
    process.env.LOGIN_CHANNEL_ID!
  );

  channels.users_nb_channel = await client.channels.fetch(
    process.env.USERS_NB_CHANNEL_ID!
  );

  channels.support_channel = await client.channels.fetch(
    process.env.SUPPORT_CHANNEL_ID!
  );

  if (
    !channels.log_channel ||
    channels.log_channel.type !== ChannelType.GuildText
  ) {
    console.error("Log channel unreachable or no text based.");
    process.exit(1);
  }

  if (
    !channels.latence_channel ||
    channels.latence_channel.type !== ChannelType.GuildVoice
  ) {
    console.error("API latence channel unreachable or no voice based.");
    process.exit(1);
  }

  if (
    !channels.login_channel ||
    channels.login_channel.type !== ChannelType.GuildText
  ) {
    console.error("Login channel unreachable or no text based.");
    process.exit(1);
  }

  if (
    !channels.users_nb_channel ||
    channels.users_nb_channel.type !== ChannelType.GuildVoice
  ) {
    console.error("Users number channel unreachable or no voice based.");
    process.exit(1);
  }

  if (
    !channels.support_channel ||
    channels.support_channel.type !== ChannelType.GuildForum
  ) {
    console.error("Support channel unreachable or no forum based.");
    process.exit(1);
  }

  // Start indexing the whole system
  await fnIndex(client);
};
run();
