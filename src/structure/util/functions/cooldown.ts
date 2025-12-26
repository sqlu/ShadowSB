export const usersCooldown: string[] = [];

const cooldown = async (id: string) => {
  usersCooldown.push(id);
  setTimeout(() => {
    usersCooldown.splice(usersCooldown.indexOf(id), 1);
  }, 8 * 1000);
};

export { cooldown };
