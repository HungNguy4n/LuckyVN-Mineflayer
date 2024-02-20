const { Client, GatewayIntentBits } = require('discord.js');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const mineflayer = require('mineflayer');
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

const name = 'TarosQ';

const bot = mineflayer.createBot({
  host: 'Luckyvn.com',
  port: 25565,
  username: name,
  version: '1.18.2',
});

function bindEvents(bot) {
  bot.on('error', function(err) {
      console.log('Error attempting to reconnect: ' + err.errno + '.');
      if (err.code == undefined) {
          console.log('Invalid credentials OR bot needs to wait because it relogged too quickly.');
          console.log('Will retry to connect in 30 seconds. ');
          setTimeout(relog, 30000);
      }
  });

  bot.on('end', function() {
      console.log("Bot has ended");
      setTimeout(relog, 30000);  
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

console.log(`${name} đang kiếm Exp và Money.`)

bot.on('login', () => {
  setTimeout(() => {
    bot.chat(`/login ${process.env.MINECRAFT_PASSWORD_TarosQ}`);
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
      } else {
        clearInterval(hubintervalId); 
      }
    }, 2000);
  }
}

bot.on('windowOpen', checkWindowForItems);

let autodropsdisable = false;

function checkcoins() {
  setInterval(() => {
    bot.chat(`/exp`);
  }, 60000);
}

function autodrops() {
  if (!autodropsdisable) {
    bot.chat('/autodrops');
    bindEvents(bot);
    checkcoins();
    checkKick = true;
    autodropsdisable = true;
  }
}
setInterval(() => {
  const mobs = (entity) => entity.type === 'animal';
  const closestMob = bot.nearestEntity(mobs);

  if (!closestMob) return;

  const pos = closestMob.position.offset(0, closestMob.height, 0);
  const distance = bot.entity.position.distanceTo(pos);

  if (distance <= 5) {
    bot.lookAt(pos);
    bot.attack(closestMob);
  }
}, 800);

const targetPosition = { x: -1269.5, y: 51, z: -819.5 };

function moveToTargetPosition() {
  const mcData = minecraftData(bot.version);

  const goal = new goals.GoalBlock(targetPosition.x, targetPosition.y, targetPosition.z);
  bot.pathfinder.setGoal(goal);
}

let isBotActivated = false;

function activateBotMovement() {
  if (!isBotActivated) {
    isBotActivated = true;
    setInterval(moveToTargetPosition, 1000);
    return true;
  } else {
    return false;
  }
}

let checkclickblock =  false;

function rightClickBlock() {
  blockPosition = bot.entity.position.offset(0, 0, -1)
  block = bot.blockAt(blockPosition)

  checkclickblock = true;
  bot.activateBlock(block);
}

setInterval(rightClickBlock, 600000);

bot.on('windowOpen', getexp);

function getexp() {
  bot.on('windowOpen', () => {
    if (checkclickblock === true) {
      bot.clickWindow(15, 0, 0);
      checkclickblock = false;
    };
  });
};

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

function formatTime(time) {
  var hours = time.getHours();
  var minutes = time.getMinutes();

  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;

  return `${hours}:${minutes}`;
}

let latestMessage = '';
let previousMessage = '';
let lastestTrader = '';

bot.on('message', async (message) => {
  const messageString = message.toString();

  if (messageString.includes(`[KNIGHT BLOCK] Chào Mừng ${name} đến với thế giới mới`)) {
    autodrops();
  }

  if (messageString.includes('[Trade] Giao dịch đã hoàn thành.')) {
    trading = false;
  }

  if (messageString.includes('[Trade] Giao dịch đã hủy.')) {
    trading = false;
  }

  if (messageString.includes(name) && messageString.indexOf(name) < messageString.indexOf('kỹ năng nữa để lên cấp.')) {
    const indexSkill = messageString.indexOf('kỹ năng nữa để lên cấp.');
    const channelIdexp = '1203624167472103484'; 
    const messageIdexp = '1208803576478961744'; 

    const channelexp = await client.channels.fetch(channelIdexp);
    const fetchedMessageexp = await channelexp.messages.fetch(messageIdexp);

    if (indexSkill !== -1) {
        const indexLevelStart = messageString.indexOf('(cấp độ') + 7;
        const indexLevelEnd = messageString.indexOf(')', indexLevelStart);
        const levelInfo = messageString.substring(indexLevelStart, indexLevelEnd).trim();

        const startIndexOfSkills = messageString.indexOf("có") + 3;
        const endIndexOfSkills = messageString.indexOf("kỹ năng");
        const skillInfo = messageString.substring(startIndexOfSkills, endIndexOfSkills).trim();

        var currentTimeexp = new Date();
        var formattedTimeexp = formatTime(currentTimeexp);
        const editedMessageexp = `\`\`\`\n 🎮 Name: ${name} |✨ Exp: ${skillInfo} (${levelInfo})  | 🕑 Time: ${formattedTimeexp}\n\`\`\``;
        await fetchedMessageexp.edit(editedMessageexp);
    }
  }
  
  if (messageString.includes('@')) {
    const usernameWithBracket = messageString.split('@')[0].trim();
    const secondBracketIndex = usernameWithBracket.indexOf(']', usernameWithBracket.indexOf(']') + 1);
    const firstSpaceIndexAfterBracket = usernameWithBracket.indexOf(' ', secondBracketIndex + 1);
    const infoAfterTrader = usernameWithBracket.substring(firstSpaceIndexAfterBracket).trim();
    const indexOfTraderMark = infoAfterTrader.indexOf("»");
    
    if (indexOfTraderMark !== -1 && indexOfTraderMark === infoAfterTrader.length - 1) {
      const trader = infoAfterTrader.substring(0, indexOfTraderMark).trim();
      lastestTrader = null;
      if (trader.includes("Taros") || trader.includes("_HungNguyenMC_")) {
        bot.chat(`/t ${trader} Đang nhận EXP và Money.`)
        rightClickBlock();
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
  }

  if (messageString.includes(`${name} Có`)) {
    const regex = new RegExp(`${name} Có (\\d+)`);
    const match = messageString.match(regex);

    if (match && match.length >= 1) {
      const coins = match[1];
      bot.chat(`/mobcoins pay _HungNguyenMC_ ${coins} `)
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN_TarosQ);