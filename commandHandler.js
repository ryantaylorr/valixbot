const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Collection, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Function to register slash commands
async function registerSlashCommands(clientId, token) {
    const rest = new REST({ version: '9' }).setToken(token);
    
    try {
      console.log('Started refreshing application (/) commands.');
  
      await rest.put(
        Routes.applicationCommands(clientId), // Change to applicationCommands
        { body: [scheduleCommand.toJSON()] },
      );
  
      console.log('Successfully registered application (/) commands.');
    } catch (error) {
      console.error(error);
    }
  }

// Function to handle interactions (commands)
function handleInteraction(client, interaction) {
    client.commands = new Collection();

    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command in file ${file} is missing a required "data" or "execute" property.`);
        }
    }
    
    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isCommand()) return;
    
        const command = client.commands.get(interaction.commandName);
    
        if (!command) return;
    
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    });
}

module.exports = {
  registerSlashCommands,
  handleInteraction,
};
