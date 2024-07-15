const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');
const config = require('./config.json');

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
    community.startConfirmationChecker(100, config.identitySecret);
    console.log('Trade Offer Manager initialized successfully.');
  });
});

/*
manager.on('newOffer', offer => {
  console.log('Trade offer detected...');
  if (offer.partner.getSteamID64() === 'Insert Steam ID 64 Here') {
    console.log('Trade offer from trusted account detected...');

    offer.accept((err, status) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`Accepted offer. Status: ${status}.`);
      }
    });
  } else {
    offer.decline(err => {
      if (err) {
        console.log(err);
      } else {
        console.log('Cancelled offer from scammer.');
      }
    });
  }
});
*/

manager.on('newOffer', offer => {
  if (offer.itemsToGive.length === 0) {
    console.log('Items received: ' + offer.itemsToReceive.length);
    offer.accept((err, status) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Donation accepted. Status: ${status}.');
      }
    });
  } else {
    console.log('Items given: ' + offer.itemsToGive.length);
    offer.decline(err => {
      if (err) {
        console.log(err);
      } else {
        console.log('Donation declined (thief)');
      }
    });
  }
});
