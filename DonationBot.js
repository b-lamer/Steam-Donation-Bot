const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');
const config = require('./config.json');
const fs = require('fs');
const path = require('path');

const leaderboardPath = path.join(__dirname, 'leaderboard.json');

const client = new SteamUser();
const community = new SteamCommunity();
const manager = new TradeOfferManager({
  steam: client,
  community: community,
  language: 'en'
});

const logOnOptions = {
  accountName: config.username,
  password: config.password,
  twoFactorCode: SteamTotp.generateAuthCode(config.sharedSecret)
};

client.logOn(logOnOptions);

client.on('loggedOn', () => {
  console.log('Logged into Steam');
  client.setPersona(SteamUser.EPersonaState.Online);
  client.gamesPlayed(730);
});

client.on('webSession', (sessionid, cookies) => {
  manager.setCookies(cookies, err => {
    if (err) {
      console.log('Error setting cookies:', err);
      return;
    }
    community.setCookies(cookies);
    community.startConfirmationChecker(10000, config.identitySecret);
    console.log('Trade Offer Manager initialized successfully.');
  });
});

manager.on('newOffer', offer => {
  console.log('New offer received.');

  if (offer.partner.getSteamID64() === 'Insert Steam 64 ID Here') {
    console.log('Trade offer from trusted account detected.');
    getPlayerName(offer);

  } else if (offer.itemsToGive.length === 0) {
    console.log('Items received: ' + offer.itemsToReceive.length);
    getPlayerName(offer);

  } else {
    console.log('Items given: ' + offer.itemsToGive.length);
    offer.decline(err => {
      if (err) {
        console.log('Error declining offer:', err);
      } else {
        console.log('Donation declined (thief)');
      }
    });
  }
});

function handleOffer(offer, playerName) {
  offer.accept((err, status) => {
    if (err) {
      console.log('Error accepting offer:', err);
    } else {
      console.log(`Accepted offer. Status: ${status}.`);

      // Check if confirmation is needed
      if (status === 'pending') {
        // Send 2FA confirmation
        community.acceptConfirmationForObject(config.identitySecret, offer.id, (err) => {
          if (err) {
            console.log('Error confirming trade offer:', err);
          } else {
            console.log('Trade offer confirmed successfully.');
            updateLeaderboard(offer.partner.getSteamID64(), playerName, offer.itemsToReceive.length);
          }
        });

      } else {
        console.log('No confirmation needed for this trade offer.');
        updateLeaderboard(offer.partner.getSteamID64(), playerName, offer.itemsToReceive.length);
      }
    }
  });
}

function readLeaderboard(){
  try {
    if (fs.existsSync(leaderboardPath,)){
      const data = fs.readFileSync(leaderboardPath, 'utf8');
      return JSON.parse(data);
    } else {
      return [];
    }
  } catch (err) {
    console.log('Error reading leaderboard file: ', err);
    return []
  }
}

function writeLeaderboard(data){
  try {
    const formattedData = data.map(entry => JSON.stringify(entry)).join(',\n ');
    const output = `[\n ${formattedData}\n]`;
    fs.writeFileSync(leaderboardPath, output, 'utf8');
    console.log('Leaderboard file updated successfully.');
  } catch (err) {
    console.log('Error writing to leaderboar file: ', err);
  }
}

function updateLeaderboard(steamID, playerName, itemsReceived){
  const leaderboardData = readLeaderboard();
  let playerFound = false;
  for (let i = 0; i < leaderboardData.length; i++) {
    if (leaderboardData[i][0] === steamID) {
      leaderboardData[i][2] += itemsReceived;
      playerFound = true;
      break;
    }
  }
  if(!playerFound) {
    leaderboardData.push([steamID, playerName, itemsReceived]);
  }
  writeLeaderboard(leaderboardData);
}

function getPlayerName(offer) {
  const steamID = offer.partner.getSteamID64();
  community.getSteamUser(offer.partner, (err, user) => {
    if (err) {
      console.log('Error getting player profile: ', err);
      return;
    }
    const playerName = user.name || 'Unknown';
    console.log(`Player Name: ${playerName}`);

    handleOffer(offer, playerName);
  });
}