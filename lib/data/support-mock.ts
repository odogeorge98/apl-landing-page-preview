export type SupportAuthor = "customer" | "admin";

export type SupportMessage = {
  id: string;
  from: SupportAuthor;
  senderName: string;
  body: string;
  sentAt: string;
};

export type SupportTicketStatus = "open" | "pending" | "resolved";

export type SupportTicket = {
  id: string;
  subject: string;
  category: string;
  status: SupportTicketStatus;
  priority: "low" | "normal" | "high";
  updatedAt: string;
  createdAt: string;
  messages: SupportMessage[];
};

export type SupportCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "Rider" | "Driver";
  memberSince: string;
  tickets: SupportTicket[];
};

const mkMsg = (
  id: string,
  from: SupportAuthor,
  senderName: string,
  body: string,
  sentAt: string,
): SupportMessage => ({ id, from, senderName, body, sentAt });

export const supportCustomers: SupportCustomer[] = [
  {
    id: "c-1",
    name: "Uche Kanu",
    email: "uche@google.com",
    phone: "+234 801 234 5678",
    role: "Rider",
    memberSince: "Aug 2024",
    tickets: [
      {
        id: "t-1",
        subject: "Refund for cancelled trip",
        category: "Billing",
        status: "open",
        priority: "high",
        createdAt: "Mar 22, 2026 · 9:12 AM",
        updatedAt: "Mar 24, 2026 · 2:14 PM",
        messages: [
          mkMsg(
            "m-1",
            "customer",
            "Uche Kanu",
            "My driver cancelled after I was charged. Trip ID PEP-88214. Please refund to my wallet.",
            "Mar 22, 2026 · 9:12 AM",
          ),
          mkMsg(
            "m-2",
            "admin",
            "PEPP Support",
            "Thanks for reporting this. We’ve located the trip and escalated to billing. You’ll get an update within 24 hours.",
            "Mar 22, 2026 · 11:40 AM",
          ),
          mkMsg(
            "m-3",
            "customer",
            "Uche Kanu",
            "Any update? It’s been two days.",
            "Mar 24, 2026 · 2:14 PM",
          ),
        ],
      },
      {
        id: "t-2",
        subject: "Wrong fare estimate",
        category: "Trips",
        status: "resolved",
        priority: "normal",
        createdAt: "Feb 3, 2026 · 4:02 PM",
        updatedAt: "Feb 5, 2026 · 10:00 AM",
        messages: [
          mkMsg(
            "m-4",
            "customer",
            "Uche Kanu",
            "The app showed ₦3,200 but I was charged ₦4,100.",
            "Feb 3, 2026 · 4:02 PM",
          ),
          mkMsg(
            "m-5",
            "admin",
            "PEPP Support",
            "We’ve added a fare adjustment of ₦900 to your Pepp Coin balance. Thanks for your patience.",
            "Feb 5, 2026 · 10:00 AM",
          ),
        ],
      },
    ],
  },
  {
    id: "c-2",
    name: "Ada Nwosu",
    email: "ada.n@mail.com",
    phone: "+234 802 555 0199",
    role: "Driver",
    memberSince: "Jan 2025",
    tickets: [
      {
        id: "t-3",
        subject: "Payout delayed",
        category: "Payouts",
        status: "pending",
        priority: "high",
        createdAt: "Mar 23, 2026 · 8:45 AM",
        updatedAt: "Mar 24, 2026 · 7:30 AM",
        messages: [
          mkMsg(
            "m-6",
            "customer",
            "Ada Nwosu",
            "Weekly payout still shows pending since Monday. Bank is GTBank.",
            "Mar 23, 2026 · 8:45 AM",
          ),
          mkMsg(
            "m-7",
            "admin",
            "PEPP Support",
            "We’re reconciling with the payment partner. I’ll confirm the settlement time today.",
            "Mar 23, 2026 · 3:10 PM",
          ),
        ],
      },
    ],
  },
  {
    id: "c-3",
    name: "Chidi Okafor",
    email: "chidi.o@mail.com",
    phone: "+234 703 111 4422",
    role: "Rider",
    memberSince: "Nov 2024",
    tickets: [
      {
        id: "t-4",
        subject: "Lost item in vehicle",
        category: "Safety",
        status: "open",
        priority: "normal",
        createdAt: "Mar 20, 2026 · 6:20 PM",
        updatedAt: "Mar 21, 2026 · 9:05 AM",
        messages: [
          mkMsg(
            "m-8",
            "customer",
            "Chidi Okafor",
            "Left a backpack in the trunk — black, trip PEP-88002 last night.",
            "Mar 20, 2026 · 6:20 PM",
          ),
          mkMsg(
            "m-9",
            "admin",
            "PEPP Support",
            "We’ve messaged the driver. Please confirm if you’d like us to arrange a return drop-off.",
            "Mar 21, 2026 · 9:05 AM",
          ),
        ],
      },
    ],
  },
];

export type SupportInboxRow = {
  ticketId: string;
  customerId: string;
  customerName: string;
  email: string;
  role: SupportCustomer["role"];
  subject: string;
  category: string;
  status: SupportTicketStatus;
  priority: SupportTicket["priority"];
  updatedAt: string;
  messageCount: number;
};

export function getSupportInboxRows(): SupportInboxRow[] {
  const rows: SupportInboxRow[] = [];
  for (const c of supportCustomers) {
    for (const t of c.tickets) {
      rows.push({
        ticketId: t.id,
        customerId: c.id,
        customerName: c.name,
        email: c.email,
        role: c.role,
        subject: t.subject,
        category: t.category,
        status: t.status,
        priority: t.priority,
        updatedAt: t.updatedAt,
        messageCount: t.messages.length,
      });
    }
  }
  return rows.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function getSupportCustomer(id: string): SupportCustomer | null {
  return supportCustomers.find((c) => c.id === id) ?? null;
}

export function getSupportKpis() {
  const rows = getSupportInboxRows();
  const open = rows.filter((r) => r.status === "open").length;
  const pending = rows.filter((r) => r.status === "pending").length;
  const resolved = rows.filter((r) => r.status === "resolved").length;
  const customers = supportCustomers.length;
  return {
    totalTickets: rows.length,
    open,
    pending,
    resolved,
    customers,
  };
}
