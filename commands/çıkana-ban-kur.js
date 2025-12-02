import { SlashCommandBuilder, ChannelType, PermissionFlagsBits } from "discord.js";
import fs from "fs";

export const data = new SlashCommandBuilder()
  .setName("çıkana-ban-kur")
  .setDescription("Sunucudan çıkanları otomatik banlamak için sistem kurar.")
  .addChannelOption(opt =>
    opt
      .setName("kanal")
      .setDescription("Ban mesajlarının gönderileceği kanal")
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const channel = interaction.options.getChannel("kanal");
  const path = "./config.json";
  let config = {};
  if (fs.existsSync(path)) config = JSON.parse(fs.readFileSync(path, "utf8"));

  config[interaction.guild.id] = { logChannel: channel.id };
  fs.writeFileSync(path, JSON.stringify(config, null, 2));

  await interaction.reply({
    content: `✅ Oto-ban sistemi bu sunucu için kuruldu!\nLog kanalı: ${channel}`,
    ephemeral: true,
  });
}
