function describeYears(years: number[]): string {
  const yearsSorted = years.sort((a, b) => a - b)
  const yearsString = yearsSorted.join(", ")
  const yearsStringLastComma = yearsString.replace(/,([^,]*)$/, " and$1")
  return yearsStringLastComma
}

export default describeYears;