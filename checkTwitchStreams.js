const axios = require('axios');
const querystring = require('querystring');
const { EmbedBuilder } = require('discord.js');
const { twitchClientId, twitchClientSecret } = require('./config.json');

// Store the access token and profile image globally
let access_token;
let liveStatus = {}; // Track live status for each user

// Function to get an access token from Twitch
async function getAccessToken(clientId, clientSecret) {
    try {
        const response = await axios.post('https://id.twitch.tv/oauth2/token', querystring.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'client_credentials',
        }));

        const { access_token, expires_in, token_type } = response.data;
        console.log('Access Token:', access_token);
        return access_token;
    } catch (error) {
        console.error('Error getting access token:', error.message);
        throw error;
    }
}

// Streamer configuration: Twitch username and their associated Discord channel
const streamers = [
    { userName: 'valix_lashten', discordChannelId: '1121214149737840721' },
    { userName: 'suddenlyari', discordChannelId: '971447927765610566' },
    { userName: 'thecaffeinatedlizard', discordChannelId: '971447927765610566' },
    { userName: 'joker_games4132', discordChannelId: '971447927765610566'},
    { userName: 's3xy_jesus', discordChannelId: '971447927765610566'},
    { userName: 'jimmygeorge814', discordChannelId: '971447927765610566'},
    { userName: 'meshamaan', discordChannelId: '971447927765610566'},
    { userName: 'slowpokefelitos', discordChannel: '971447927765610566'},
    { userName: 'kraftykatze', discordChannel: '971447927765610566'},
    { userName: 'gsm2017', discordChannel: '971447927765610566'}
];

// Function to check if streamers are live and send notification
async function checkLiveStreams(accessToken, client) {
    try {
        for (const streamer of streamers) {
            const { userName, discordChannelId } = streamer;
            
            // Log which streamer we are checking
           // console.log(`Checking live status for: ${userName}`);

            // Get Twitch user data
            const userDataResponse = await axios.get(`https://api.twitch.tv/helix/users?login=${userName}`, {
                headers: {
                    'Client-ID': twitchClientId,
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (userDataResponse.data.data.length === 0) {
                console.log(`No user data found for ${userName}`);
                continue;
            }

            const userData = userDataResponse.data.data[0];
            const userId = userData.id;
            const profileImageUrl = userData.profile_image_url;

           // console.log(`User ID for ${userName}: ${userId}`);

            // Get stream data
            const streamDataResponse = await axios.get(`https://api.twitch.tv/helix/streams?user_id=${userId}`, {
                headers: {
                    'Client-ID': twitchClientId,
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            const streamData = streamDataResponse.data.data[0];

            // Check if the streamer is live
            if (streamData) {
                console.log(`${userName} is currently live!`);

                if (!liveStatus[userId] || !liveStatus[userId].isLive) {
                    console.log(`----------------------------------->\n${userName} was not previously live. Sending live notification.`);

                    const embed = new EmbedBuilder()
                        .setTitle(`Hey Everyone!\n${userName} Is currently LIVE!\nCheck info below!`)
                        .setURL(`https://www.twitch.tv/${userName}`)
                        .setAuthor({ name: userName, iconURL: profileImageUrl })
                        .setDescription(streamData.title || 'No description available.')
                        .addFields(
                            { name: 'Current Game:', value: streamData.game_name || 'No game information available' }
                        )
                        .setImage(streamData.thumbnail_url.replace('{width}', '640').replace('{height}', '360'))
                        .setColor('#50C878')
                        .setTimestamp();

                    // Send the embed to the corresponding Discord channel
                    const channel = await client.channels.fetch(discordChannelId);
                    if (channel) {
                        await channel.send({ embeds: [embed] });
                        console.log(`Live notification sent to Discord channel: ${discordChannelId}\n----------------------------------->`);
                    } else {
                        console.error(`Could not find Discord channel with ID: ${discordChannelId}`);
                    }

                    liveStatus[userId] = { isLive: true, lastChecked: Date.now() }; // Update live status
                }
            } else {
                if (liveStatus[userId] && liveStatus[userId].isLive) {
                    console.log(`${userName} went offline.`);
                    liveStatus[userId] = { isLive: false, lastChecked: Date.now() }; // Reset live status when offline
                } else {
                   // console.log(`${userName} is not live.`);
                }
            }
        }
    } catch (error) {
        console.error('Error checking live streams:', error);
    }
}

// Example function to run at regular intervals
async function runStreamCheck(client) {
    const accessToken = await getAccessToken(twitchClientId, twitchClientSecret);
    setInterval(() => checkLiveStreams(accessToken, client), 60000); // Check every 5 minutes
}

module.exports = {
    getAccessToken,
    checkLiveStreams,
    runStreamCheck
};

