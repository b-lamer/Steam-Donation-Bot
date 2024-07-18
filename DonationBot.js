//Dependencies that are needed, User and Totp for logging in, community and tradeoffermanager for trade processing.
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

//Logs in, needs all fields filled in the config file to log in properly.
const logOnOptions = {
  accountName: config.username,
  password: config.password,
  twoFactorCode: SteamTotp.generateAuthCode(config.sharedSecret)
};

client.logOn(logOnOptions);

//Notifies client when user is logged in, will automatically be playing csgo (ID: 730) to show it's active.
client.on('loggedOn', () => {
  console.log('Logged into Steam');

  client.setPersona(SteamUser.EPersonaState.Online);
  client.gamesPlayed(730);
});

//Passes cookies into trade manager, will not detect trades properly if API key isn't set in config file.
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

//Once a trade is detected, checks that length of the items given array is 0, and if it is then it accepts the trade, otherwise rejects.
manager.on('newOffer', offer => {
  console.log('New trade offer detected...');
  //This if statement checks whether the Steam64 ID is equal to your set 'trusted account' and will auto accept any trade from the 
  //account you specify
  if (offer.partner.getSteamID64() === 'Insert Steam ID 64 Here') {
    console.log('Trade offer from trusted account detected...');
    offer.accept((err, status) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`Accepted offer. Status: ${status}.`);
      }
    });
  }
  //This other if statement is the one that is described above
  if (offer.itemsToGive.length === 0) {
    offer.accept((err, status) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`Donation accepted. Status: ${status}.`);
      }
    });
  } else {
    offer.decline(err => {
      if (err) {
        console.log(err);
      } else {
        console.log('Donation declined (thief)');
      }
    });
  }
});
