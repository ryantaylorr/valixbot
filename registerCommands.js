const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const path = require('path');

// Function to register slash commands globally
async function registerGlobalSlashCommands(clientId, token) {
  const rest = new REST({ version: '9' }).setToken(token);

  const commands = [];
  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
    } else {
      console.log(`[WARNING] The command in file ${file} is missing a required "data" or "execute" property.`);
    }
  }

  try {
    console.log('Started refreshing global application (/) commands.');

    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands },
    );

    console.log('Successfully registered global application (/) commands.');
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  registerGlobalSlashCommands,
};
 