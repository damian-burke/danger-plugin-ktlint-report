import { GitDSL } from "danger"
import { getChangedLinesByFile, isFileInChangeset } from "../file/file"
import { reportViolationsForLines } from "../report/report"

type MarkdownString = string

const fileDiffs: FileDiff[] = []

/**
 *
 * @param git Git object used to access changesets
 * @param report JavaScript object representation of the checkstyle report
 * @param root Root directory to sanitize absolute paths
 */
export async function scanReport(
  git: GitDSL,
  report: any,
  root: string,
  messageCallback: (msg: MarkdownString, fileName: string, line: number) => void
) {
  const violations: Violation[] = []
  const files: string[] = []

  if (report.elements && report.elements[0].elements) {


    // report.elements[0] == checkstyle tag
    console.log(`---- Report ----`)
    console.log(report)
    console.log("-------")

    console.log(`---- Report.elements[0] ----`)
    console.log(report.elements[0])
    console.log("-------")

    
    console.log(`---- Report.elements[0].elements ----`)
    console.log(report.elements[0].elements)
    console.log("-------")

    report.elements[0].elements.forEach(fileElement => {
      const fileName = fileElement.attributes.name.replace(root, "").replace(/^\/+/, "")

      fileElement.elements.forEach(errorElement => {
        const attributes = errorElement.attributes
        const line = +attributes.line
        const column = +attributes.column
        const severity = attributes.severity
        const msg = attributes.message

        violations.push({
          file: fileName,
          line,
          column,
          severity,
          message: msg,
        })
      })
    })

    violations.forEach(violation => {
      const file = violation.file
      if (!files.includes(file)) {
        if (isFileInChangeset(git, file)) {
          files.push(file)
        }
      }
    })

    // parse each file, wait for all to finish
    for (const file of files) {
      const lineDiff = await getChangedLinesByFile(git, file)

      fileDiffs.push({
        file,
        added_lines: lineDiff,
      })
    }

    reportViolationsForLines(violations, fileDiffs, messageCallback)
  }
}
