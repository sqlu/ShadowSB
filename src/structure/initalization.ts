import { type Client, REST, Routes } from "discord.js";
import { Client as User } from "discord.js-selfbot-v13";
import { readdirSync } from "fs";
import { join } from "path";
import { callLogin } from "../events/login";
import { callLogout } from "../events/logout";
import db from "./util/lib/database";

// Create a new Map to store all users clients
export const userClients: User[] = [];

const fnInit = async (client: Client) => {
  // Get the time when the function is called
  const startTime = Date.now();

  // Get all Discord token of all users
  const users = await db.user.findMany({
    select: {
      token: true,
    },
  });

  console.log("Start login all users...");

  // For each user, create a new client and login with the token
  await Promise.all(
    users.map(async (user: any) => {
      const userClient = new User();

      await userClient.login(user.token).catch(async (err: Error) => {
        await callLogout(client, user.token);
      });

      const elapsedTime = Date.now() - startTime;

      // Install the application to user's apps
      await userClient
        .installUserApps(process.env.APPLICATION_ID!)
        .catch(() => false);

      userClients.push(userClient);
      await callLogin(client, userClient, elapsedTime);
    })
  );

  // Register all slashCommands
  const commands = [];
  const commandsPath = join(__dirname, "../commands");
  const commandFiles = readdirSync(commandsPath).filter((file) =>
    file.endsWith(".js")
  );

  for (const file of commandFiles) {
    const { props } = await import(join(commandsPath, file));
    commands.push(props);
  }

  const rest = new REST({ version: "10" }).setToken(
    process.env.APPLICATION_TOKEN!
  );

  try {
    const globalCommands = commands.filter(
      (command) => command.name !== "owner"
    );

    for (const command of commands) {
      if (command.name === "owner") {
        // Register the "owner" command only on a specific server
        await rest.put(
          Routes.applicationGuildCommands(
            client.user!.id,
            process.env.OWNER_GUILD_ID!
          ),
          { body: [command] }
        );
      }
    }

    await rest.put(Routes.applicationCommands(client.user!.id), {
      body: globalCommands,
    });
  } catch (error) {
    console.error(error);
  }

  // WORKING ON
  /*
  const app = express();
  const port = process.env.PORT || 3333;

  app.use(express.json());

  app.get("/", (req: any, res: any) => {
    res.send("Hello World!");
  });

  app.get("/status", (req: any, res: any) => {
    res.json({ status: "ok", userCount: userClients.length });
  });

  app.post("/login", (req: any, res: any) => {
    const type = "token"
    if(type === "token"){
      
    } else {

    }
  });

  app.listen(port, () => {
    console.log(`API is now running at http://localhost:${port}`);
  });
  */

  return;
};

export default fnInit as typeof fnInit;
