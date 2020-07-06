import { exception } from "console"

export function parseCheckstyle(report: any, root: string): Violation[] {
  if (!report.elements || !report.elements[0]) {
    throw new Error(`Can not parse input.`)
  }

  const rootType = report.elements[0].type
  const rootName = report.elements[0].name
  const rootVersion = report.elements[0].attributes.version

  switch (rootVersion) {
    case "8.0":
      return parseCheckstyle8_0(report, root)

    default:
      throw new Error(`Checkstyle version ${rootVersion} is not supported.`)
  }
}

function parseCheckstyle8_0(report: any, root: string): Violation[] {
  const violations: Violation[] = []

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

  return violations
}
