/**
 * Timezone utilities for UI components.
 */

export interface TimezoneOption {
  value: string;
  label: string;
  offset: number;
}

/**
 * Returns a list of all supported IANA timezones with their GMT offsets.
 * Format: (GMT±HH:mm) Region/City
 */
export function getTimezoneOptions(): TimezoneOption[] {
  const supportedTimezones = Intl.supportedValuesOf("timeZone");
  const timezones = supportedTimezones.includes("UTC")
    ? supportedTimezones
    : ["UTC", ...supportedTimezones];
  const now = new Date();

  const options = timezones.map((tz) => {
    try {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        timeZoneName: "longOffset",
      });

      const parts = formatter.formatToParts(now);
      const offsetString = parts.find((p) => p.type === "timeZoneName")?.value || "";

      // Calculate numeric offset for sorting
      // offsetString is something like "GMT-03:00" or "GMT+05:30"
      let offsetMinutes = 0;
      const match = offsetString.match(/GMT([+-])(\d{1,2}):(\d{2})/);
      if (match) {
        const sign = match[1] === "+" ? 1 : -1;
        const hours = parseInt(match[2] || "0", 10);
        const minutes = parseInt(match[3] || "0", 10);
        offsetMinutes = sign * (hours * 60 + minutes);
      }

      return {
        value: tz,
        label: `(${offsetString}) ${tz.replace(/_/g, " ")}`,
        offset: offsetMinutes,
      };
    } catch {
      return {
        value: tz,
        label: tz.replace(/_/g, " "),
        offset: 0,
      };
    }
  });

  // Sort by offset, then by name
  return options.sort((a, b) => {
    if (a.offset !== b.offset) {
      return a.offset - b.offset;
    }
    return a.label.localeCompare(b.label);
  });
}
