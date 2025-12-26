import type { Client } from "discord.js";
import buttonHandler from "./handler/buttons";
import commandHandler from "./handler/commands";
import crashHandler from "./handler/crash";
import selectHandler from "./handler/select";
import fnInit from "./initalization";
import fnWhenReady from "./whenReady";

/*
 * This function is the main function of the structure.
 * It will call all the structure actions.
 */

const fnIndex = async (client: Client) => {
  // Handle all inputs
  crashHandler(client);
  commandHandler(client);
  buttonHandler(client);
  selectHandler(client);

  // When the client is ready
  await fnWhenReady(client);

  // Initialize the structure
  fnInit(client);

  return;
};

export default fnIndex as typeof fnIndex;
