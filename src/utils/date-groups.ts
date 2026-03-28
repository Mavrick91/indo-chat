export type DateGroup =
  | "Today"
  | "Yesterday"
  | "Last 7 days"
  | "Last 30 days"
  | "Older";

export type ConversationSummary = {
  id: number;
  title: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type GroupedConversations = {
  label: DateGroup;
  conversations: ConversationSummary[];
}[];

export function groupConversationsByDate(conversations: ConversationSummary[]) {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const DAY_MS = 24 * 60 * 60 * 1000;
  const t = startOfToday.getTime();
  const startOfYesterday = new Date(t - DAY_MS);
  const startOfLast7Days = new Date(t - 7 * DAY_MS);
  const startOfLast30Days = new Date(t - 30 * DAY_MS);

  const buckets: Record<DateGroup, ConversationSummary[]> = {
    Today: [],
    Yesterday: [],
    "Last 7 days": [],
    "Last 30 days": [],
    Older: [],
  };

  for (const conv of conversations) {
    const created = conv.createdAt instanceof Date
      ? conv.createdAt
      : new Date(conv.createdAt);
    if (created >= startOfToday) {
      buckets["Today"].push(conv);
    } else if (created >= startOfYesterday) {
      buckets["Yesterday"].push(conv);
    } else if (created >= startOfLast7Days) {
      buckets["Last 7 days"].push(conv);
    } else if (created >= startOfLast30Days) {
      buckets["Last 30 days"].push(conv);
    } else {
      buckets["Older"].push(conv);
    }
  }

  return (Object.keys(buckets) as DateGroup[])
    .filter((label) => buckets[label].length > 0)
    .map((label) => ({ label, conversations: buckets[label] }));
}
