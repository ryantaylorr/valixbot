
const { token, guildId, clientId, discordChannelId, twitchClientId, twitchClientSecret } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');
const { readdirSync } = require('fs');
const { Client, Events, GatewayIntentBits, Partials, ActivityType, Collection, EmbedBuilder } = require('discord.js');
const { ReactionRole } = require("discordjs-reaction-role");
const axios = require('axios');
const querystring = require('querystring');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { registerGlobalSlashCommands } = require('./registerCommands');
const { checkLiveStreams, getAccessToken, access_token, runStreamCheck } = require('./checkTwitchStreams');




registerGlobalSlashCommands(clientId, token);

// CLIENT // 

const client = new Client({
  partials: [Partials.Message, Partials.Reaction],
  intents: [GatewayIntentBits.MessageContent, GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildVoiceStates],
});


client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    client.commands.set(command.data.name, command);
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
});




// When the bot is ready
client.on('ready', async () => {
  try {
    console.log('Bot Active.');
    // Set bot activity
    client.user.setActivity({
        name: "streams.",
        type: ActivityType.Listening,
    });


        const accessToken = await getAccessToken(twitchClientId, twitchClientSecret);
        if (!accessToken) {
            console.error('Failed to obtain access token.');
            return;
        }

        // Start checking streamers periodically
        runStreamCheck(client);

    } catch (error) {
        console.error('Error during initialization:', error.message);
    }
});

// Log in to Discord
client.login(token);
