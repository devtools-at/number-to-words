/**
 * Number to Words
 * Convert numbers to written words
 *
 * Online tool: https://devtools.at/tools/number-to-words
 *
 * @packageDocumentation
 */

function convertHundreds(num: number, ordinal: boolean = false): string {
  let result = "";

  const hundred = Math.floor(num / 100);
  const remainder = num % 100;

  if (hundred > 0) {
    result += ones[hundred] + " hundred";
    if (remainder > 0) {
      result += " ";
    }
  }

  if (remainder >= 20) {
    const tensDigit = Math.floor(remainder / 10);
    const onesDigit = remainder % 10;

    if (ordinal && onesDigit === 0) {
      result += ordinalTens[tensDigit];
    } else if (ordinal && onesDigit > 0) {
      result += tens[tensDigit] + "-" + ordinalOnes[onesDigit];
    } else {
      result += tens[tensDigit];
      if (onesDigit > 0) {
        result += "-" + ones[onesDigit];
      }
    }
  } else if (remainder >= 10) {
    const teensIndex = remainder - 10;
    result += ordinal ? ordinalTeens[teensIndex] : teens[teensIndex];
  } else if (remainder > 0) {
    result += ordinal ? ordinalOnes[remainder] : ones[remainder];
  } else if (num === 0 && ordinal) {
    return "zeroth";
  }

  return result;
}

function convertIntegerToWords(num: number, ordinal: boolean = false): string {
  if (num === 0) {
    return ordinal ? "zeroth" : "zero";
  }

  if (num < 0) {
    return "negative " + convertIntegerToWords(-num, ordinal);
  }

  const parts: string[] = [];
  let thousandIndex = 0;
  let remaining = num;

  while (remaining > 0) {
    const chunk = remaining % 1000;
    if (chunk > 0) {
      const isLastChunk = remaining < 1000;
      const chunkWords = convertHundreds(chunk, ordinal && isLastChunk);
      const scale = thousands[thousandIndex];
      parts.unshift(chunkWords + (scale ? " " + scale : ""));
    }
    remaining = Math.floor(remaining / 1000);
    thousandIndex++;
  }

  return parts.join(" ").trim();
}

function convertDecimalToWords(decimalPart: string): string {
  const words = decimalPart.split("").map(digit => ones[parseInt(digit)]).join(" ");
  return words;
}

function convertToWords(input: string, ordinal: boolean = false): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  // Remove commas
  const cleaned = trimmed.replace(/,/g, "");

  // Check for valid number
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) {
    throw new Error("Invalid number format");
  }

  const [integerPart, decimalPart] = cleaned.split(".");
  const integerNum = parseInt(integerPart);

  // Check for overflow (max safe integer)
  if (Math.abs(integerNum) > Number.MAX_SAFE_INTEGER) {
    throw new Error("Number is too large");
  }

  let result = convertIntegerToWords(integerNum, ordinal && !decimalPart);

  if (decimalPart) {
    result += " point " + convertDecimalToWords(decimalPart);
  }

  return result;
}

function convertToCurrency(input: string, currency: string = "USD"): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  // Remove currency symbols and commas
  const cleaned = trimmed.replace(/[$€£¥,]/g, "");

  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    throw new Error("Invalid currency format");
  }

  const [dollars, cents] = cleaned.split(".");
  const dollarNum = parseInt(dollars);

  if (dollarNum > Number.MAX_SAFE_INTEGER) {
    throw new Error("Amount is too large");
  }

  let result = "";

  const currencyNames: Record<string, { major: string; minor: string }> = {
    USD: { major: "dollar", minor: "cent" },
    EUR: { major: "euro", minor: "cent" },
    GBP: { major: "pound", minor: "pence" },
    JPY: { major: "yen", minor: "sen" },
  };

  const currencyName = currencyNames[currency] || currencyNames.USD;

  if (dollarNum === 0) {
    result = "zero " + currencyName.major + "s";
  } else if (dollarNum === 1) {
    result = "one " + currencyName.major;
  } else {
    result = convertIntegerToWords(dollarNum) + " " + currencyName.major + "s";
  }

  if (cents) {
    const centsNum = parseInt(cents.padEnd(2, "0"));
    if (centsNum > 0) {
      result += " and ";
      if (centsNum === 1) {
        result += "one " + currencyName.minor;
      } else {
        result += convertIntegerToWords(centsNum) + " " + currencyName.minor + "s";
      }
    }
  }

  return result;
}

// Export for convenience
export default { encode, decode };
