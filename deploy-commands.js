import { REST, Routes } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

const commands = [];
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

try {
  console.log("⏳ Slash komutları yükleniyor...");
  await rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID),
    { body: commands }
  );
  console.log("✅ Slash komutları başarıyla yüklendi!");
} catch (error) {
  console.error(error);
}
