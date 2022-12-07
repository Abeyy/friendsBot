require("dotenv").config(); //initialize dotenv
const { Client, Intents, User, interaction } = require("discord.js");
var moment = require("moment");

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_WEBHOOKS,
    Intents.FLAGS.DIRECT_MESSAGES,
  ],
}); //create new client

const GENERALCHANNELID = '692855176847163425';
const RUNECHANNELID = '1049934513612017706';
const CHANNELID = "877018954516807680";

client.on("ready", () => {
  console.log(`Client is ready:  ${client.user.tag}!`);
});

const userIsPartOfChannel = async (userId, channelId) => {
  let userIsPartOfChannel = await client.channels.fetch(channelId).then(channel => {
    const members = Array.from(channel.members.keys())

    if (members.includes(userId)) {
      return true
    } else {
      return false
    }
  })

  return userIsPartOfChannel;
}

const remindUserToSetRunes = (activities, userId) => {
  if (!userIsPartOfChannel(userId, RUNECHANNELID)) {
    return
  }

  activities.forEach(async (activity) => {
    if (activity.name === 'League of Legends' && activity.state === 'In Champion Select') {
      let msg = `<@${userId}>, dont forget to set your runes!`
      client.channels.cache.get(RUNECHANNELID).send(msg);
    }
  })
}

const checkIfUserIsPlayingLoL = (activities) => {
  let isPlaying = false;
  activities.forEach((activity) => {
    // TODO: Check if type is necessary:
    if (activity.name === "League of Legends" && activity.type === "PLAYING") {
      isPlaying = true;
    }
  });

  return isPlaying;
};

const UserCache = {};

client.on("presenceUpdate", function (oldPresence, newPresence) {

  // For now, we dont care if they arent playing league:
  let userIsPlayingLoL = checkIfUserIsPlayingLoL(newPresence?.activities);
  if (!userIsPlayingLoL) {
    return;
  }

  const userId = newPresence.userId;
  const now = moment();

  remindUserToSetRunes(newPresence?.activities, userId)

  // Check user cache
  if (UserCache[userId] !== undefined) {
    if (moment.duration(now.diff(UserCache[userId])).asHours() < 3) {
      return;
    } else {
      UserCache[userId] = now;
    }
  } else {
    UserCache[userId] = now;
  }

  let user = client.users.cache.get(userId);
  let username = user.username;
  let msg = `User: ${username} is playing League of Legends (${now.format(
    "hh:mm:ss"
  )})`;

  client.channels.cache.get(CHANNELID).send(msg);
});

//make sure this line is the last line
client.login(process.env.CLIENT_TOKEN); //login bot using token
