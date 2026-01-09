---
description: Non-interactive article review (complete version)
---

Review the article for quality and conformance to project specifications.

Think carefully about the plan to improve the article content. Follow this plan precisely to ensure you do not miss a step.

## Avoid

- NEVER change quoted text, except for the quoted source description
- NEVER change the meaning of the text, unless the user explicitly asked to do so
- Markdown may contain double spaces before line end characters. This is normal as it indicate a line break. Do not remove those spaces.

## Layout

The layout of the article should be:

1. Frontmatter (with `description` and `keywords`)
2. H1 Title
3. Introduction
4. Main content with optional sub sections
5. Conclusion

## Format

- The first line of the article content (after the frontmatter) contains an H1 title as first heading
- There are 1 and only 1 H1 title in the article
- The main content of the article should not deviate from the purpose of the article.
- The main content should be sub-divided into H2 headers if the content is very long.
- Keep the H2 headers as short as possible, but still unique.
- Ensure logical heading hierarchy (no skipped levels)
- Avoid using em dashes (—) or en dashes (–) in sentences except for quoted sources. Rather use multiple short sentences with periods `.` that flow into each other.
- Convert ` -- ` double hyphens in quoted sources to em dashes.
- Quoted sources are format `> Quoted text — Source`. Note the the em dash is wrapped with spaces on both sides. The source could be a bible verse, a name of another author or book, or a link to an external website.

## Markdown

- Convert underscore markdown headers `-------` to hashed headers prefixed with `##`
- Tables use standard markdown
- Blockquotes use standard markdown
- Content should be markdown linter compliant

## Errors

- Ignore grammar errors in quoted text.
- Fix grammar and spelling errors, but **NEVER** fix grammar errors in quoted text. Quoted text should be kept quoted as-is even if the grammar in the quoted text is wrong

## References

- Ensure that markdown links within the same document to anchors/headers are valid.
- Fragments preserved, for example `path/page.md#anchor`
- Images co-located in same directory as markdown, unless it links to an external website
- Image naming: `{page}.{descriptor}.{ext}` (avoid duplication if the image has the same name as the page, for example `church.church.jpg`)
- Alt text provided for accessibility
- Check that bible verses are quoted correctly from the bible: If a bible verse is incorrectly quoted, fix the quote. If the correct bible verses was referenced by comparing the context/sentence in which the bible verse appear. For example `Jesus said love your enemies (Genesis 1:1)` is wrong because that is not what Genesis 1:1 says. In these cases, replace it with the correct scripture reference.
- Quoted bible verses contains the full bible book name, for example: `John 3:16 (ESV)`
- Correct bible verses of different books are separated by semi-colons `;`, for example: `Genesis 1; Exodus 1:1; Leviticus 1`
- Correct bible verses of the same book but different chapters are separated by a comma and a space `, ` for example `Genesis 1:1, 2:1, 3:1`
- Correct bible verses of the same book and chapter are separated by a comma only `,` (without spaces) for example `Genesis 1:1-3,5-7,11,13`. If now colon `:` was included, you may assume the number means a verse of the previous chapter, for example `Genesis 1:1,3` means Genesis 1:1 and Genesis 1:3
- Replace only Old Testament bible verses that refer to `the Lord` (lowercase) with `the LORD` (ALL CAPS). New Testament bible verses may refer to `the Lord` (lowercase).
- If possible, add additional evidence like bible scriptures to support the author's statements

## Style

- Add an introduction (if missing): Introductions should make it clear what topic the article will explore without giving away the main argument or point of the article. The introduction should rather trigger the reader's curioucity and encourage them to read it. The introduction should not be offensive to any group or people with a strong view point against the article main argument.
- Rephrase the author explanations if it is hard to follow his reasoning
- Check if the author's tone appear arrogant, offensive or divisive. Replace the author's sarcasm or rhetorical questions with objective statements.
- Rephrases sentences that include em dashes (—) or en dashes (–), by breaking it up into multiple short sentences with periods that flow into each other.
- If the author deviated from the title or description of the article, clean up his deviation so that the article's flow is still logical.
- Facts and evidence should be presented in the third person.
- Only allow first person statements like "I think...", "We believe...", "You should..." if the author explicitly provide his unproven opinion.
- Check that the author's sentences are readable without unnecessary repetitions (except for quoted text): Rephrase unnecessary repetitions.
- The final conclusion should only summarize the main argument or point of the article without explanations and evidence. Each statement in the conclusion should be backed by a section in the main content with a markdown link in the text to that section for further reading or evidence.

## Critique

- Remove contradictions against the author's own content
- The article should never contradict itself. Instead it should objectively list the different views of groups and let the reader decide which view he prefers.
- Check for reasoning errors or fallacies: Rephrase the author's arguments to communicate the intended message but without logical reasoning errors.
- When the author make controversal statements, think how critiques may argue against it and add a defence against the critical arguments to this article.

## Frontmatter

- The article description will be used as a meta tag element that describes the page for SEO. Insure that the description is search engine compliant and not longer than 160 characters. The description should compliment the introduction of the article by providing a brief description of which topic the article will explore without giving away the main argument or point of the article. The like the introduction, description should also be non offensive to any group or view point.
- Update the `keywords` field of the frontmatter with sensible keywords related to the main points of this article. Use unique keywords that would make this article stand out among other articles. Avoid using common or generic terms as keywords.

## Lookup

These evaluations require additional look ups using your build-in tools to access the internet online. Create a plan for each of these statements you want to research online and research each statement individually.

- Ensure internal relative links (to other documents in this same git module) are valid: If it is not obvious what the link should be, remove the markdown link but keep the text of the link. Internal links use .md extension: `[text](path/page.md)`
- Check if the page of an external links exist and contains the content the link suggest to provide (except for links to https://eternal.family.net.za): If the external link is wrong, remove the markdown link but keep the text of the link.
- If possible, add links to external websites that support the author's views
- Unless the author specifically says a statement is his opinion ("I think...", "It seems like...", "Possible interpretations are..."), you need to check online if his opinion is factually proven: Either add a bible verse that support the author's opinion or research online which external website support the author's opinion. If you find supporting evidence online include markdown links to external websites in the text of the author's statement. If no support to the author opinion could be provided, remove the opinion if it is not factually proven. If the author's opinion is refuted by evidence, correct it with markdown links in the text to the evidence.
- Arguments should make logically sense, and include evidence like bible scriptures references or markdown links in the text to reputable external websites.
