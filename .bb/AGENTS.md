# BB guidance for this repository

- For UI changes, inspect only the affected component and breakpoint rules. Verify the reported width, the nearest breakpoint, and one representative device width; stop once those checks answer the question.
- Avoid recursive source-tree searches with surrounding context. Search the smallest likely file set, cap results, and do not print generated or minified one-line markup.
- Run `npm run check` and `npm run build` once after the final edit. Repeat only after another source change or when a check reveals a problem.
- Summarize prior findings and reuse them across turns instead of repeating browser or shell checks.
