import { type Client } from "discord.js";
import { Client as User, VoiceState } from "discord.js-selfbot-v13";
import db from "../structure/util/lib/database";

const callVoiceStateUpdate = async (client: Client, user: User) => {
  user.on(
    "voiceStateUpdate",
    async (oldState: VoiceState, newState: VoiceState) => {
      try {
        if (!oldState.channel || !newState.channel || !newState.channel.isVoice() || !newState.channel.members.has(user.user!.id)) return;

        const state = await db.user.findUnique({
          where: { id: user.user!.id },
          select: { antimute: true },
        });

        if (state?.antimute && oldState.mute !== true && newState.mute === true) {
          try {
            const member = newState.guild?.members.cache.get(user.user!.id)!;
            await member.voice.setMute(false);
          } catch (error) {
            console.error("Erreur lors du démute:", error);
          }
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'état vocal:", error);
      }
    }
  );
};

export { callVoiceStateUpdate };
