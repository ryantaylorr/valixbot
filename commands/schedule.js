const { SlashCommandBuilder } = require('@discordjs/builders');
const querystring = require('querystring');
const { EmbedBuilder} = require('discord.js');
const { profileImageUrl, userName } = require('../checkTwitchStreams.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('schedule')
    .setDescription('Get the streamer\'s schedule'),
  
  async execute(interaction) {
    // Replace this with code to retrieve the streamer's schedule
    

    const schedule = 'Monday: 8:30AM EST\nWednesday: 8:30AM EST\nFriday: 8:30AM EST';
    // Create an embed to display the schedule
    const embed = new EmbedBuilder()
      .setImage('https://i.imgur.com/7J63mjY.png')
      
      .addFields(
        { name: '\u200B', value: '\u200B' },)
      .setFooter({ text: 'made by beanjuice ❤️'});
      
    
    // Reply with the embed
    await interaction.reply({ embeds: [embed]});
  },
};


