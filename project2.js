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
  client.gamesPlayed(440);
});

client.on('webSession', (sessionid, cookies) => {
  manager.setCookies(cookies);

  community.setCookies(cookies);
  community.startConfirmationChecker(10000, config.idSecret);

  console.log('Trade Offer Manager initialized successfully.');
});

manager.on('newOffer', offer => {
  console.log('Trade offer detected...')
    if (offer.partner.getSteamID64() === 'your_trusted_account_id') {
      console.log('Trade offer from trusted account detected...')
      
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
          console.log('Canceled offer from scammer.');
        }
      });
    }
  });