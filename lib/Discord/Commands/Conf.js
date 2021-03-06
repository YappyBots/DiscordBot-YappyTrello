const Command = require("../Command");
const Util = require("../../Util");
const ChannelConfig = require("../../Models/ChannelConfig");

class ConfCommand extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: "conf",
      description: "set configuration for trello channel",
      usage: "conf [view/get/set] [property] [\"value\"]",
      examples: [
        `conf`,
        `conf get disabledEvents`,
        `conf set disabledEvents "moveCard moveList updateCard"`,
      ],
    };

    this.setConf({
      permLevel: 1,
      aliases: ["config"],
    });
  }

  run(msg, args) {
    args = this.bot.generateArgs(args);
    let action = args[0] || "view";
    let property = args[1];
    let value = args[2];

    if (action === "set") return this.confSet(msg, property, value);
    if (action === "view") return this.confView(msg);
  }

  confView(msg) {
    let conf = ChannelConfig.FindByChannel(msg.channel.id);
    if (!conf) return this._hasNoConf(msg);
    let message = [
      "```ini",
      `[ ${msg.guild.name.toUpperCase()}'s #${msg.channel.name} Configuration ]`,
      `Guild   : ${msg.guild.name}`,
      `Channel : #${msg.channel.name}`,
      `Owner   : ${msg.guild.owner.user.username}`,
      ``,
      `${Util.Pad("disabledEvents", 15)} = ${conf.disabledEvents[0] ? conf.disabledEvents.join(", ") : "None"}`,
      "```",
    ];
    return msg.channel.send(message);
  }

  confSet(msg, prop, val) {
    let conf = ChannelConfig.FindByChannel(msg.channel.id);
    if (prop === "disabledEvents") {
      val = msg.client.generateArgs(val);
    }
    return conf.set(prop, val)
    .then(() => msg.channel.send(`✅ Successfully set config key \`${prop}\` to \`${val[0] ? val : " "}\``))
    .catch((err) => msg.channel.send(`❌ Unable to update config for this channel.\n\`${err}\``));
  }

  _hasNoConf(msg) {
    return msg.channel.send(`This channel has no configuration, as it holds no receiver for any Trello events`);
  }
}


module.exports = ConfCommand;
