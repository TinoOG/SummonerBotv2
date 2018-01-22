const Discord = require("discord.js");
var axios = require('axios');
const client = new Discord.Client();
const config = require("./config.json");

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('ready', () => {
  client.user.setActivity("your game here",{type: "YOUR TYPE HERE"});
 });

client.on("guildMemberAdd", user => {
    axios.get(`https://discordapp.com/api/v6/users/${user.id}/profile`, { headers: { 'Authorization': 'user_key_here' } }).then((response) => {
        var accounts = response.data.connected_accounts;
        var filteredAccounts = accounts.filter(function (item) {
            return item.type == "leagueoflegends";
        });
        var leagueAccount = filteredAccounts[0] || null;
        if (leagueAccount != null) {
            axios.get(`https://eun1.api.riotgames.com/lol/league/v3/positions/by-summoner/${leagueAccount.id.split(`_`)[1]}?api_key=riot_key_here`).then((response) => {
                var league = response.data.filter(function (queue) {
                    return queue.queueType == "RANKED_SOLO_5x5";
                })[0] || null;

                if (league != null) {
                    var matchingRoles = user.guild.roles.filter(function (role) {
                        return role.name == league.tier;
                    }) || null;

                    user.addRoles(matchingRoles);
                    user.sendMessage(`Your role has been updated to \`${league.tier}\``);
                }
                else {
                    var unrankedRole = user.guild.roles.filter(function (role) {
                        return role.name == "UNRANKED";
                    }) || null;

                    user.addRoles(unrankedRole);
                    user.sendMessage(`Welcome! Your role has been updated to \`UNRANKED\``);
                }
            });
        }
    });
});

client.on("message", async message => {
    if (message.author.bot) return;

    if (message.content.indexOf(config.prefix) !== 0) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command === "ping") {
        const m = await message.channel.send("Ping?");
        m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
    }

    if (command === "update") {
        axios.get(`https://discordapp.com/api/v6/users/${message.author.id}/profile`, { headers: { 'Authorization': 'user_key_here' } }).then((response) => {
            var accounts = response.data.connected_accounts;
            var filteredAccounts = accounts.filter(function (item) {
                return item.type == "leagueoflegends";
            });
            var leagueAccount = filteredAccounts[0] || null;
            if (leagueAccount != null) {
                axios.get(`https://eun1.api.riotgames.com/lol/league/v3/positions/by-summoner/${leagueAccount.id.split(`_`)[1]}?api_key=riot_key_here`).then((response) => {
                    var league = response.data.filter(function (queue) {
                        return queue.queueType == "RANKED_SOLO_5x5";
                    })[0] || null;

                    var removableRoles = message.channel.guild.roles.filter(function (role) {
                        return role.name == "BRONZE" || role.name == "SILVER" || role.name == "GOLD" || role.name == "PLATINUM" || role.name == "DIAMOND" || role.name == "CHALLENGER" || role.name == "UNRANKED";
                    });

                    if (league != null) {
                        var matchingRoles = message.channel.guild.roles.filter(function (role) {
                            return role.name == league.tier;
                        }) || null;

                        message.member.removeRoles(removableRoles);
                        setTimeout(() => {
                            message.member.addRoles(matchingRoles);
                        }, 1500);

                        message.channel.send(`Your role has been updated to \`${league.tier}\``);
                    }
                    else {
                        var unrankedRole = message.member.guild.roles.filter(function (role) {
                            return role.name == "UNRANKED";
                        }) || null;

                        message.member.removeRoles(removableRoles);
                        setTimeout(() => {
                            message.member.addRoles(unrankedRole);
                        }, 1500);

                        message.channel.send(`Your role has been updated to \`UNRANKED\``);
                    }


                });
            }
        });
    }
});

client.on("ready", client => {
    console.log("your ready message here");
});

client.login(config.token);