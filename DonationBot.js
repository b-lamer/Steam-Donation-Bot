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
    community.startConfirmationChecker(10000, config.identitySecret);
    console.log('Trade Offer Manager initialized successfully.');
  });
});

manager.on('newOffer', offer => {
  console.log('New offer received from:', offer.partner.getSteamID64());

  if (offer.partner.getSteamID64() === 'Insert Steam64 ID here') {
    console.log('Trade offer from trusted account detected...');
    handleOffer(offer);
  } else if (offer.itemsToGive.length === 0) {
    console.log('Items received: ' + offer.itemsToReceive.length);
    handleOffer(offer);
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

function handleOffer(offer) {
  offer.accept((err, status) => {
    if (err) {
      console.log('Error accepting offer:', err);
    } else {
      console.log(`Accepted offer. Status: ${status}.`);
      // Sends 2FA confirmation
      community.acceptConfirmationForObject(config.identitySecret, offer.id, (err) => {
        if (err) {
          console.log('Error confirming trade offer:', err);
        } else {
          console.log('Trade offer confirmed successfully.');
        }
      });
    }
  });
}