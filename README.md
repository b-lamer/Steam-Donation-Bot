### Prerequisites:
- You will need to install [node.js and npm](https://nodejs.org/en)
- [steam-user](https://www.npmjs.com/package/steam-user) (npm i steam-user)
- [steam-totp](https://www.npmjs.com/package/steam-totp) (npm i steam-totp)
- [steam-tradeoffer-manager](https://www.npmjs.com/package/steam-tradeoffer-manager) (npm i steam-tradeoffer-manager)
- [steam-community](https://www.npmjs.com/package/steamcommunity) (npm i steamcommunity)

### Steps to get bot working:
1. Fill out config file with username, password, [sharedSecret](https://gist.github.com/mathielo/8367e464baa73941a075bae4dd5eed90), idSecret, and [apiKey](https://steamcommunity.com/dev/apikey).
2. (NOT REQUIRED) In addition to this in the DonationBot.js file there is an 'if' statement under the manager.on that needs you to enter your SteamID64. If you do not fill this out then it will still work, you just won't have an administrator account to remotely retrieve items from the bot. 
3. As long as the packages above are installed, you can run the bot by opening cmd, navigating to the correct directory, and using "node DonationBot.js"
4. It will display the login process in your console. If you get any errors it should print them so that they can be fixed.

### Donation Tracking Info:
Once the bot is running and someone donates an item, the program will create a "leaderboard.json" file that will keep track of the SteamID64, name, and total items donated by that user.
The username does not update with each donation, and the file is just sorted by oldest -> newest donators.
