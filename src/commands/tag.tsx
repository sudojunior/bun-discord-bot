import {
  ApplicationCommand as JSXApplicationCommand,
  StringOption,
  UserOption,
} from "@lilybird/jsx";
import { getTags, searchTag } from "../loaders/tags.ts";
import { ApplicationCommand } from "@lilybird/handlers";

export default {
  post: "GLOBAL",
  data: (
    <JSXApplicationCommand name="tag" description="Get tag">
      <StringOption
        name="query"
        description="Select query"
        required
        autocomplete
      />
      <UserOption name="target" description="User to mention" />
    </JSXApplicationCommand>
  ),
  run: async (interaction) => {
    if (!interaction.inGuild()) return;
    const query = interaction.data.getString("query", true);
    const target = interaction.data.getUser("target");

    const tag = searchTag(interaction.channel, query, false);
    if (!tag) {
      return interaction.reply({
        content: `\`❌\` Could not find a tag \`${query.replace(/(@&?)(here|everyone|\d+)/, '$1\u200b$2')}\``,
        ephemeral: true,
      });
    }

    await interaction.reply({
      content: [
        target ? `*Suggestion for <@${target}>:*\n` : "",
        `**${tag.question}**`,
        tag.answer,
      ].join("\n"),
      // allowedMentions: {
      //     parse: ["users"]
      // }
    });
  },
  autocomplete: async (interaction) => {
    if (!interaction.inGuild()) return;
    const query = interaction.data.getFocused<string>().value;
    if (!query) {
      return await interaction.showChoices(getTags(interaction.channel, 25));
    }

    const tags = searchTag(interaction.channel, query, true);
    if (tags.length > 0) return await interaction.showChoices(tags);

    return await interaction.showChoices(getTags(interaction.channel, 25));
  },
} satisfies ApplicationCommand;
