import type { Channel } from "discord.js";

type configChannelsType = {
  log_channel: Channel | null;
  support_channel: Channel | null;
  latence_channel: Channel | null;
  login_channel: Channel | null;
  users_nb_channel: Channel | null;
};

export default configChannelsType;
