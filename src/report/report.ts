type MarkdownString = string

export function reportViolationsForLines(
  violations: Violation[],
  fileDiffs: FileDiff[],
  messageCallback: (msg: MarkdownString, fileName: string, line: number) => void
) {
  // we got all changed lines in fileDiffs (file => list of line)
  violations.forEach(violation => {
    const file = violation.file
    const line = violation.line

    const diff = fileDiffs.find(element => element.file === file)

    if (diff) {
      if (diff.modified_lines.includes(line)) {
        messageCallback(violation.message, violation.file, violation.line)
      }
    }
  })
}
