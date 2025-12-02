import { Client, GatewayIntentBits, Collection, Events, ActivityType } from "discord.js";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();

// Komutları yükle
const commandFiles = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));
for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, () => {
  console.log(`✅ Giriş yapıldı: ${client.user.tag}`);
  cycleStatus();
});

// Döngülü durum
function cycleStatus() {
  const messages = [
    () => `💼 ${client.guilds.cache.size} sunucu`,
    () => `👥 ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} kullanıcı`,
    () => `🤖 /çıkana-ban-kur ile sistemi ayarla!`,
  ];
  let i = 0;
  setInterval(() => {
    const msg = messages[i % messages.length]();
    client.user.setPresence({
      activities: [{ name: msg, type: ActivityType.Watching }],
      status: "online",
    });
    i++;
  }, 15000);
}

// Slash komutları
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (e) {
    console.error(e);
    await interaction.reply({ content: "❌ Komut çalıştırılırken hata oluştu.", ephemeral: true });
  }
});

// 🔥 Kullanıcı sunucudan ayrıldığında sadece o sunucuda banla
client.on(Events.GuildMemberRemove, async member => {
  console.log(`[DEBUG] ${member.user.tag} ${member.guild.name} sunucusundan ayrıldı.`);
  const path = "./config.json";
  if (!fs.existsSync(path)) return;
  
  const config = JSON.parse(fs.readFileSync(path, "utf8"));
  const guildConfig = config[member.guild.id];
  if (!guildConfig || !guildConfig.logChannel) return;

  const logChannel = member.guild.channels.cache.get(guildConfig.logChannel);
  if (!logChannel) return;

  try {
    await member.ban({ reason: "Sunucudan çıktığı için oto-ban sistemi tarafından yasaklandı." });
    await logChannel.send(`> <:ceza:1435278685946122240> **${member.user.tag}** sunucudan çıktığı için otomatik ban yedi.`);
  } catch (err) {
    console.error(`[HATA] ${member.guild.name}: Ban başarısız ->`, err);
    await logChannel.send(`⚠️ ${member.user.tag} banlanamadı: ${err.message}`);
  }
});

client.login(process.env.TOKEN);
