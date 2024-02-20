const { Client, GatewayIntentBits } = require('discord.js');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const mineflayer = require('mineflayer');
const moment = require('moment-timezone');
const minecraftData = require('minecraft-data');

require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const name = '_HungNguyenMC_';

const bot = mineflayer.createBot({
  host: 'Luckyvn.com',
  port: 25565,
  username: name,
  version: '1.18.2',
});

console.log(`${name} đang Farm.`)

function formatTime(time) {
  const timeZone = 'Asia/Ho_Chi_Minh';
  return moment(time).tz(timeZone).format('HH:mm');
}

function bindEvents(bot) {
  bot.on('error', function(err) {
      console.log('Error attempting to reconnect: ' + err.errno + '.');
      if (err.code == undefined) {
          console.log('Invalid credentials OR bot needs to wait because it relogged too quickly.');
          console.log('Will retry to connect in 30 seconds. ');
      }
  });

  bot.on('end', function() {
    console.log("Bot has ended");
    setTimeout(relog, 15000);  
  });

  bot.on('death', function() {
    nohubatt = false;
    setTimeout(() => {
      botAlive = true;
      moveToTargetPosition();
    }, 25000);
    setTimeout(() => {
      bot.chat(`/home`);
      setTimeout(() => {
        nohubatt = true;
        moveToTargetPosition();
      }, 5000);
    }, 5000);
  });
}

function relog() {
  console.log("Attempting to reconnect...");
  bot = mineflayer.createBot({
    host: 'Luckyvn.com',
    port: 25565,
    username: name,
    version: '1.18.2',
  });
  bindEvents(bot);
}

bot.on('login', () => {
  setTimeout(() => {
    bot.chat(`/login ${process.env.MINECRAFT_PASSWORD}`);
  }, 2000);
});

bot.on('spawn', () => {
  setTimeout(() => {
    bot.chat('/survival');
  }, 3000);
});

bot.loadPlugin(pathfinder);

let hubintervalId;
let foodchecktools = false;
let checkKick = false;

function checkWindowForItems() {
  const Hubitems = bot.inventory.items();
  const item798 = Hubitems.find(item => item.type === 798);
  const item815 = Hubitems.find(item => item.type === 815);
  
  if (item798 && item815) {
    if (checkKick === true) {
      checkKick = false;
      const userId = '935766223357087764'; 

      client.users.fetch(userId).then(user => {
        if (user) {
          user.send(`${name} đã bị Kick!`);
        }
      }).catch(console.error);
    };

    setTimeout(() => {
      bot.clickWindow(15, 0, 0);
    }, 1000);
    setTimeout(() => {
      bot.clickWindow(2, 0, 0);
    }, 1000);
    hubintervalId = setInterval(() => {
      const item815s = bot.inventory.items().find(item => item.type === 815);
      const item798s = bot.inventory.items().find(item => item.type === 798);
      if (item815s && item798s) {
        bot.clickWindow(2, 0, 0);
        autodropsdisable = false;
        nohubatt = false;
      } else {
        clearInterval(hubintervalId); 
      }
    }, 5000);
  }
}

bot.on('windowOpen', checkWindowForItems);

let autodropsdisable = false;

function expandCoinsAndExp() {
    bot.chat('/mobcoins viewcoins _HungNguyenMC_');
    bot.chat('/exp');
    setTimeout(expandCoinsAndExp, 5 * 60 * 1000);
}

function autodrops() {
  if (!autodropsdisable) {
    bot.chat('/autodrops');
    bindEvents(bot);
    expandCoinsAndExp();
    setTimeout(() => {
      bot.chat(`/home`)
      setTimeout(() => {
        moveToTargetPosition();
      }, 6000);
    }, 3000);
    checkKick = true;
    nohubatt = true;
    autodropsdisable = true;
  }
}

let nohubatt = false;

setInterval(() => {
  const mobs = (entity) => entity.displayName === 'Zombie' || entity.type === 'animal' || entity.type === 'player';
  const closestMob = bot.nearestEntity(mobs);

  if (!closestMob) return;

  const pos = closestMob.position.offset(0, closestMob.height, 0);
  const distance = bot.entity.position.distanceTo(pos);

  if (distance <= 6 && nohubatt === true) {
    bot.lookAt(pos);
    const Hubitems = bot.inventory.items();
    const item798 = Hubitems.find(item => item && typeof item === 'object' && item.type === 724);
    const item707 = Hubitems.find(item => item.type === 707);

    if (!item798) {
      return;
    }

    const currentItem = bot.inventory.slots[bot.getEquipmentDestSlot('hand')];
    const desiredItemID = 798;
    const FoodtoolsID = 707;

    if ((!currentItem || currentItem.type !== desiredItemID) && !foodchecktools) {
      bot.equip(item798, 'hand');
    } else if (foodchecktools && (!currentItem || currentItem.type !== FoodtoolsID) && bot.food < 2) {
      bot.equip(item707, 'hand');
      bot.chat(`/feed`);
    }
    
    if (bot.food > 1 && foodchecktools) {
      foodchecktools = false;
      bot.chat(`/t ${lastestTrader} Thanh thức ăn đã tăng!`)
      bot.chat(`/trade ${lastestTrader}`)
    }
    
    bot.attack(closestMob);
    moveToTargetPosition();
  }
}, 600);

let botAlive = false;

const targetPosition = { x: 459.5, y: 151, z: 2916.5 };

function moveToTargetPosition() {
  if (botAlive === true) {
    botAlive = false;
    return;
  }

  const mcData = minecraftData(bot.version);

  const goal = new goals.GoalBlock(targetPosition.x, targetPosition.y, targetPosition.z);
  bot.pathfinder.setGoal(goal);
}

let trading = false;
let hasClicked = false;

function checkChestStatus() {
  bot.on('windowOpen', (window) => {
    const chestName = window.title.toLowerCase();
    if (!trading && chestName.includes('giao dịch với')) { 
      trading = true;
      chest = window;
      tradegui();
      const intervalId = setInterval(() => {
        if (trading && !hasClicked) {
          const slot14 = window.slots[14];
          if (slot14 && slot14.type === 359) {
            bot.clickWindow(12, 0, 0);
            hasClicked = true;
          }
        } else {
          clearInterval(intervalId);
          hasClicked = false; 
        }
      }, 500);
    }
  });
}

function tradegui() {
  const items = bot.inventory.items(); 
  const Nitem702 = items.find(item => item.type === 702);  
  const Nitem683 = items.find(item => item.type === 683);

  if (Nitem702) {
    chest.deposit(Nitem702.type, null, Nitem702.count);
  } 
  else if (Nitem683) {
    chest.deposit(Nitem683.type, null, 1);
  }
}

let latestMessage = '';
let previousMessage = '';
let lastestTrader = '';

bot.on('message', async (message) => {
  const messageString = message.toString();

  if (messageString.includes(`[KNIGHT BLOCK] Chào Mừng ${name} đến với thế giới mới`)) {
    autodrops();
  }

  if (messageString.includes(name) && messageString.indexOf(name) < messageString.indexOf('kỹ năng nữa để lên cấp.')) {
    const indexSkill = messageString.indexOf('kỹ năng nữa để lên cấp.');
    const channelId1 = '1203624167472103484'; 
    const messageId1 = '1205350282519912489'; 

    const channel1 = await client.channels.fetch(channelId1);
    const fetchedMessage1 = await channel1.messages.fetch(messageId1);

    if (indexSkill !== -1) {
        const indexLevelStart = messageString.indexOf('(cấp độ') + 7;
        const indexLevelEnd = messageString.indexOf(')', indexLevelStart);
        const levelInfo = messageString.substring(indexLevelStart, indexLevelEnd).trim();

        const startIndexOfSkills = messageString.indexOf("có") + 3;
        const endIndexOfSkills = messageString.indexOf("kỹ năng");
        const skillInfo = messageString.substring(startIndexOfSkills, endIndexOfSkills).trim();

        var currentTime1 = new Date();
        var formattedTime1 = formatTime(currentTime1);
        const editedMessage1 = `\`\`\`\n✨ Exp: ${skillInfo} (${levelInfo})  | 🕑 Time: ${formattedTime1}\n\`\`\``;
        await fetchedMessage1.edit(editedMessage1);
    }
  }

  if (messageString.includes(`${name} Có`)) {
    const regex = new RegExp(`${name} Có (\\d+)`);
    const match = messageString.match(regex);
    const channelId2 = '1203624167472103484'; 
    const messageId2 = '1205350911451336796'; 

    const channel2 = await client.channels.fetch(channelId2);
    const fetchedMessage2 = await channel2.messages.fetch(messageId2);

    if (match && match.length >= 1) {
      const coins = match[1];
      var currentTime2 = new Date();
      var formattedTime2 = formatTime(currentTime2);
      const editedMessage2 = `\`\`\`\n🎟️ Mobcoins: ${coins}  | 🕑 Time: ${formattedTime2}\n\`\`\``;
      await fetchedMessage2.edit(editedMessage2);
    }
  }

  if (messageString.includes('[Trade] Giao dịch đã hoàn thành.')) {
    trading = false;
  }

  if (messageString.includes('[Trade] Giao dịch đã hủy.')) {
    trading = false;
  }
  
  let lastestTrader1 = null;

  if (messageString.includes('_HungNguyenMC_')) {
    const usernameWithBracket1 = messageString.split('_HungNguyenMC_')[0].trim();
    const secondBracketIndex1 = usernameWithBracket1.indexOf(']', usernameWithBracket1.indexOf(']') + 1);
    const firstSpaceIndexAfterBracket1 = usernameWithBracket1.indexOf(' ', secondBracketIndex1 + 1);
    const infoAfterTrader1 = usernameWithBracket1.substring(firstSpaceIndexAfterBracket1).trim();
    const indexOfTraderMark1 = infoAfterTrader1.indexOf("»");
  
    if (indexOfTraderMark1 !== -1 && indexOfTraderMark1 === infoAfterTrader1.length - 1) {
      const trader1 = infoAfterTrader1.substring(0, indexOfTraderMark1).trim();
      lastestTrader1 = trader1;
      if (lastestTrader1 !== null) {
        bot.chat(`/t ${lastestTrader1} Gọi cái cl gì, t đang thì Farm ://`);
        lastestTrader1 = null;
      }
    }
  }


  if (messageString.includes('!')) {
    const usernameWithBracket = messageString.split('!')[0].trim();
    const secondBracketIndex = usernameWithBracket.indexOf(']', usernameWithBracket.indexOf(']') + 1);
    const firstSpaceIndexAfterBracket = usernameWithBracket.indexOf(' ', secondBracketIndex + 1);
    const infoAfterTrader = usernameWithBracket.substring(firstSpaceIndexAfterBracket).trim();
    const indexOfTraderMark = infoAfterTrader.indexOf("»");
    
    if (indexOfTraderMark !== -1 && indexOfTraderMark === infoAfterTrader.length - 1) {
      const trader = infoAfterTrader.substring(0, indexOfTraderMark).trim();
      lastestTrader = null;
      if (trader.includes("Taros")) {
        if (bot.food > 1) {
          bot.chat(`/trade ${trader}`);
          foodchecktools = false;
        } else {
          bot.chat(`/t ${trader} Đang đói!`);
          foodchecktools = true;
          lastestTrader = trader;
        }
      }
    }
  }

  if (messageString.includes('[Trade]') && messageString.includes('đang không ở gần!')) {
    const startKeyword = '[Trade] Người chơi';
    const endKeyword = 'đang không ở gần!';
    const start = messageString.indexOf(startKeyword) + startKeyword.length + 1;
    const end = messageString.indexOf(endKeyword) - 1;
    const traderfar = messageString.substring(start, end);
    bot.chat(`/t ${traderfar} Bạn ở quá xa!`)
  };

  if (messageString.includes("[Trade] Yêu cầu cho")) {
    checkChestStatus()  
  }

  if (messageString.includes('❤ Máu')) {
    if (messageString !== previousMessage) {
      latestMessage = messageString;
      previousMessage = '';
      previousMessage = latestMessage; 
    }
  }

  if (messageString.includes(name) && messageString.indexOf(name) < messageString.indexOf('by')) {
    const userId = '935766223357087764'; 

    client.users.fetch(userId).then(user => {
      if (user) {
        user.send(`${messageString}`);
      }
    }).catch(console.error);
  }
});

setInterval(async () => {
  if (latestMessage !== '') {
    const channelId = '1203624167472103484'; 
    const messageId = '1203644113229053963'; 

    const channel = await client.channels.fetch(channelId);
    const fetchedMessage = await channel.messages.fetch(messageId);

    if (fetchedMessage) {
      var currentTime = new Date();
      var formattedTime = formatTime(currentTime);
      const editedMessage = `\`\`\`\n${latestMessage} | 🕑 Time: ${formattedTime}\n\`\`\``;
      await fetchedMessage.edit(editedMessage);
      latestMessage = ''; 
    }
  }
}, 60000);

client.login(process.env.DISCORD_BOT_TOKEN);