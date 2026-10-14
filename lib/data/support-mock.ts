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
  role: "Student" | "Tutor";
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
    email: "uche.kanu@example.com",
    phone: "+234 801 234 5678",
    role: "Student",
    memberSince: "Aug 2025",
    tickets: [
      {
        id: "t-1",
        subject: "Unable to access my programme",
        category: "Programme access",
        status: "open",
        priority: "high",
        createdAt: "Oct 12, 2026 · 9:12 AM",
        updatedAt: "Oct 14, 2026 · 2:14 PM",
        messages: [
          mkMsg(
            "m-1",
            "customer",
            "Uche Kanu",
            "My Cybersecurity programme is not appearing on my dashboard. Could you help me check my enrolment?",
            "Oct 12, 2026 · 9:12 AM",
          ),
          mkMsg(
            "m-2",
            "admin",
            "Nugi Support",
            "Thanks for letting us know. We’re checking your programme enrolment and will follow up with you shortly.",
            "Oct 12, 2026 · 11:40 AM",
          ),
          mkMsg(
            "m-3",
            "customer",
            "Uche Kanu",
            "Thank you. I can now see the programme on my dashboard.",
            "Oct 14, 2026 · 2:14 PM",
          ),
        ],
      },
      {
        id: "t-2",
        subject: "Where can I find lesson materials?",
        category: "Learning resources",
        status: "resolved",
        priority: "normal",
        createdAt: "Sep 3, 2026 · 4:02 PM",
        updatedAt: "Sep 5, 2026 · 10:00 AM",
        messages: [
          mkMsg(
            "m-4",
            "customer",
            "Uche Kanu",
            "I am not sure where lesson notes and resources are available for my course.",
            "Sep 3, 2026 · 4:02 PM",
          ),
          mkMsg(
            "m-5",
            "admin",
            "Nugi Support",
            "Open your student dashboard and select your programme to find its learning resources. We have also added this to the course guide.",
            "Sep 5, 2026 · 10:00 AM",
          ),
        ],
      },
    ],
  },
  {
    id: "c-2",
    name: "Ada Nwosu",
    email: "ada.nwosu@example.com",
    phone: "+234 802 555 0199",
    role: "Tutor",
    memberSince: "Jan 2025",
    tickets: [
      {
        id: "t-3",
        subject: "Assignment submissions need review",
        category: "Assignments",
        status: "pending",
        priority: "high",
        createdAt: "Oct 13, 2026 · 8:45 AM",
        updatedAt: "Oct 13, 2026 · 3:10 PM",
        messages: [
          mkMsg(
            "m-6",
            "customer",
            "Ada Nwosu",
            "Several learner submissions are not appearing in my review queue. I submitted the grades yesterday.",
            "Oct 13, 2026 · 8:45 AM",
          ),
          mkMsg(
            "m-7",
            "admin",
            "Nugi Support",
            "We’re checking the review queue and will confirm once the submissions are visible.",
            "Oct 13, 2026 · 3:10 PM",
          ),
        ],
      },
    ],
  },
  {
    id: "c-3",
    name: "Chidi Okafor",
    email: "chidi.okafor@example.com",
    phone: "+234 703 111 4422",
    role: "Student",
    memberSince: "Nov 2025",
    tickets: [
      {
        id: "t-4",
        subject: "Help updating my profile details",
        category: "Account and profile",
        status: "open",
        priority: "normal",
        createdAt: "Oct 10, 2026 · 6:20 PM",
        updatedAt: "Oct 11, 2026 · 9:05 AM",
        messages: [
          mkMsg(
            "m-8",
            "customer",
            "Chidi Okafor",
            "I need to update the phone number on my learner profile. Where can I make this change?",
            "Oct 10, 2026 · 6:20 PM",
          ),
          mkMsg(
            "m-9",
            "admin",
            "Nugi Support",
            "Please review your profile and contact your programme administrator if the phone number field is locked.",
            "Oct 11, 2026 · 9:05 AM",
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
  return rows.sort((a, b) => {
    const updatedAtA = Date.parse(a.updatedAt.replace(" · ", " "));
    const updatedAtB = Date.parse(b.updatedAt.replace(" · ", " "));
    return updatedAtB - updatedAtA;
  });
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
