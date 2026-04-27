export type AppRole = "ADMIN" | "MANAGER" | "OFFICER" | "AGENT" | "USER";

export type ManagerDesignationType =
	| "FULL"
	| "LOAN_APPROVAL"
	| "LOAN_OPERATIONS" // combined: loan approval + operations (backend sends this)
	| "OPERATIONS"
	| "COMPLIANCE"
	| "KYC_COMPLIANCE" // KYC verification & compliance checks only
	| "AUDIT"
	| "FRAUD";

export type OfficerDesignationType = "FULL";

export type DashboardNavItem = {
	label: string;
	href: string;
	moduleKey: string;
	icon?: string;
	matchPrefixes?: string[];
	exactMatch?: boolean;
	/** true = used for access-key filtering only, not shown in sidebar */
	hideFromNav?: boolean;
};

export type DashboardNavGroup = {
	title: string;
	icon?: string;
	items: DashboardNavItem[];
};

type RoleNavigationMap = Record<AppRole, DashboardNavGroup[]>;

type NavigationContext = {
	managerDepartment?: string | null;
	officerDesignation?: string | null;
};

const roleHome: Record<AppRole, string> = {
	ADMIN: "/admin/profile",
	MANAGER: "/manager/dashboard",
	OFFICER: "/officer/dashboard",
	AGENT: "/agent/dashboard",
	USER: "/user/dashboard",
};

// ─── Manager nav groups ───────────────────────────────────────────────────────

const managerNavGroups: DashboardNavGroup[] = [
	{
		title: "Core",
		icon: "LayoutDashboard",
		items: [
			{
				label: "Dashboard",
				href: "/manager/dashboard",
				moduleKey: "dashboard",
				icon: "LayoutDashboard",
				exactMatch: true,
			},
		],
	},
	{
		title: "Loan Management",
		icon: "ClipboardList",
		items: [
			{
				label: "Loan Queue",
				href: "/manager/loans/pending",
				moduleKey: "loans.pending",
				icon: "ClipboardList",
				matchPrefixes: ["/manager/loans"],
			},
			// Sub-page keys for access-control; not shown as separate nav links
			{
				label: "Review Loan",
				href: "/manager/loans/pending",
				moduleKey: "loans.review",
				hideFromNav: true,
			},
			{
				label: "Verification Evidence",
				href: "/manager/loans/pending",
				moduleKey: "loans.evidence",
				hideFromNav: true,
			},
			{
				label: "Assign Agent",
				href: "/manager/loans/pending",
				moduleKey: "agents.assignment",
				hideFromNav: true,
			},
		],
	},
	{
		title: "Staff Management",
		icon: "Users",
		items: [
			{
				label: "Staff Hub",
				href: "/manager/staff",
				moduleKey: "staff",
				icon: "Users",
				exactMatch: true,
			},
			{
				label: "Create Agent",
				href: "/manager/staff/agents/create",
				moduleKey: "staff.agents.create",
				icon: "UserPlus",
				matchPrefixes: ["/manager/staff/agents"],
			},
			{
				label: "Create Officer",
				href: "/manager/staff/officers/create",
				moduleKey: "staff.officers.create",
				icon: "Briefcase",
				matchPrefixes: ["/manager/staff/officers"],
			},
			{
				label: "Create Manager",
				href: "/manager/staff/managers/create",
				moduleKey: "staff.managers.create",
				icon: "Building2",
				matchPrefixes: ["/manager/staff/managers"],
			},
		],
	},
	{
		title: "Audit & Compliance",
		icon: "ShieldCheck",
		items: [
			{
				label: "Audit Logs",
				href: "/manager/audit/logs",
				moduleKey: "audit.logs",
				icon: "ScrollText",
				matchPrefixes: ["/manager/audit/logs"],
			},
			{
				label: "Flagged Entries",
				href: "/manager/audit/flags",
				moduleKey: "audit.flags",
				icon: "Flag",
				matchPrefixes: ["/manager/audit/flags"],
			},
			{
				label: "Assisted Actions",
				href: "/manager/audit/assisted-actions",
				moduleKey: "audit.assisted-actions",
				icon: "Activity",
				matchPrefixes: ["/manager/audit/assisted-actions"],
			},
			{
				label: "Audit Trail",
				href: "/manager/audit/trail",
				moduleKey: "audit.trail",
				icon: "History",
				matchPrefixes: ["/manager/audit/trail"],
			},
			{
				label: "KYC Records",
				href: "/manager/kyc",
				moduleKey: "kyc.records",
				icon: "ScanLine",
				matchPrefixes: ["/manager/kyc"],
			},
		],
	},
	{
		title: "Fraud Detection",
		icon: "AlertOctagon",
		items: [
			{
				label: "Fraud Alerts",
				href: "/manager/fraud/alerts",
				moduleKey: "fraud.alerts",
				icon: "AlertOctagon",
				matchPrefixes: ["/manager/fraud/alerts"],
			},
			{
				label: "Fraud Cases",
				href: "/manager/fraud/cases",
				moduleKey: "fraud.cases",
				icon: "ShieldAlert",
				matchPrefixes: ["/manager/fraud/cases"],
			},
			{
				label: "Fraud Audit Logs",
				href: "/manager/fraud/audit-logs",
				moduleKey: "fraud.audit-logs",
				icon: "FileSearch",
				matchPrefixes: ["/manager/fraud/audit-logs"],
			},
		],
	},
	{
		title: "Settings",
		icon: "Settings2",
		items: [
			{
				label: "Reports",
				href: "/manager/reports",
				moduleKey: "reports",
				icon: "BarChart2",
				matchPrefixes: ["/manager/reports"],
			},
			{
				label: "Profile",
				href: "/manager/profile",
				moduleKey: "profile",
				icon: "UserCircle",
				exactMatch: true,
			},
		],
	},
];

/** Flat list of all manager items — used by getModuleLabel */
const managerModuleItems: DashboardNavItem[] = managerNavGroups.flatMap(
	(g) => g.items,
);

// ─── Officer nav items ────────────────────────────────────────────────────────

const officerModuleItems: DashboardNavItem[] = [
	{ label: "Dashboard", href: "/officer/dashboard", moduleKey: "dashboard", icon: "LayoutDashboard" },
	{
		label: "Leads Management",
		href: "/officer/leads",
		moduleKey: "leads.queue",
		icon: "Users",
		matchPrefixes: ["/officer/leads"],
	},
	{
		label: "KYC Review",
		href: "/officer/kyc",
		moduleKey: "kyc.review.queue",
		icon: "ShieldCheck",
		matchPrefixes: ["/officer/kyc"],
	},
	{
		label: "Loan Review",
		href: "/officer/loans",
		moduleKey: "loan.review.queue",
		icon: "ClipboardList",
		matchPrefixes: ["/officer/loans"],
	},
	{
		label: "Cash Disbursal",
		href: "/officer/cash-disbursal",
		moduleKey: "cash.disbursal",
		icon: "Wallet",
		matchPrefixes: ["/officer/cash-disbursal"],
	},
	{
		label: "Cash Settlements",
		href: "/officer/cash/settlements",
		moduleKey: "cash.settlements",
		icon: "Landmark",
		matchPrefixes: ["/officer/cash/settlements"],
	},
	{
		label: "Settlement History",
		href: "/officer/cash/history",
		moduleKey: "cash.history",
		icon: "History",
		matchPrefixes: ["/officer/cash/history"],
	},
	{ label: "Profile", href: "/officer/profile", moduleKey: "profile", icon: "UserCircle" },
];

// ─── Role nav map ─────────────────────────────────────────────────────────────

const navByRole: RoleNavigationMap = {
	USER: [
		{
			title: "User",
			items: [
				{ label: "Dashboard", href: "/user/dashboard", moduleKey: "dashboard" },
				{
					label: "Profile / Onboarding",
					href: "/user/onboarding",
					moduleKey: "profile-onboarding",
				},
				{ label: "KYC", href: "/user/kyc", moduleKey: "kyc" },
				{
					label: "Apply Loan",
					href: "/user/loans/apply",
					moduleKey: "apply-loan",
				},
				{
					label: "My Loans",
					href: "/user/loans",
					moduleKey: "my-loans",
				},
				{
					label: "Payment History",
					href: "/user/payments",
					moduleKey: "payment-history",
					matchPrefixes: ["/user/payments"],
				},
			],
		},
	],
	ADMIN: [
		{
			title: "Admin",
			items: [
				{ label: "Profile", href: "/admin/profile", moduleKey: "profile" },
				{
					label: "Branch Management",
					href: "/admin/branches",
					moduleKey: "branch-management",
					matchPrefixes: ["/admin/branches"],
				},
				{
					label: "Branch Managers",
					href: "/admin/managers",
					moduleKey: "branch-managers",
				},
				{
					label: "Branch Metrics",
					href: "/admin/metrics",
					moduleKey: "branch-metrics",
					matchPrefixes: ["/admin/metrics"],
				},
				{
					label: "AI Scoring",
					href: "/admin/ai-scoring",
					moduleKey: "ai-scoring",
				},
			],
		},
	],
	OFFICER: [
		{
			title: "Officer",
			items: officerModuleItems,
		},
	],
	AGENT: [
		{
			title: "Agent",
			items: [
				{
					label: "Dashboard",
					href: "/agent/dashboard",
					moduleKey: "dashboard",
				},
				{
					label: "Profile / Onboarding",
					href: "/agent/profile",
					moduleKey: "profile-onboarding",
				},
				{
					label: "Tasks",
					href: "/agent/tasks",
					moduleKey: "tasks",
					matchPrefixes: ["/agent/tasks"],
				},
				{
					label: "User Verification",
					href: "/agent/verification",
					moduleKey: "verification",
					matchPrefixes: ["/agent/verification"],
				},
				{
					label: "Verification Images Upload",
					href: "/agent/verification/images-upload",
					moduleKey: "verification.images-upload",
				},
				{
					label: "Cash Distribution",
					href: "/agent/cash-distribution",
					moduleKey: "cash-distribution",
					matchPrefixes: ["/agent/cash-distribution"],
				},
				{
					label: "Leads",
					href: "/agent/leads",
					moduleKey: "leads",
					matchPrefixes: ["/agent/leads"],
				},
				{
					label: "Apply Loan for User",
					href: "/agent/loan-for-user",
					moduleKey: "apply-loan-for-user",
				},
			],
		},
	],
	MANAGER: managerNavGroups,
};

// ─── Module access per designation ───────────────────────────────────────────

const managerSidebarModules: Record<ManagerDesignationType, string[]> = {
	FULL: managerModuleItems.map((item) => item.moduleKey),

	LOAN_APPROVAL: [
		"dashboard",
		"loans.pending",
		"loans.review",
		"loans.evidence",
		"agents.assignment",
		"reports",
		"profile",
	],

	/** Backend sends "LOAN_OPERATIONS" — can approve loans AND manage staff */
	LOAN_OPERATIONS: [
		"dashboard",
		"loans.pending",
		"loans.review",
		"loans.evidence",
		"agents.assignment",
		"staff",
		"staff.agents.create",
		"staff.officers.create",
		"staff.managers.create",
		"reports",
		"profile",
	],

	OPERATIONS: [
		"dashboard",
		"staff",
		"staff.agents.create",
		"staff.officers.create",
		"staff.managers.create",
		"reports",
		"profile",
	],

	COMPLIANCE: [
		"dashboard",
		"audit.logs",
		"audit.flags",
		"audit.assisted-actions",
		"audit.trail",
		"reports",
		"profile",
	],

	AUDIT: [
		"dashboard",
		"audit.logs",
		"audit.flags",
		"audit.assisted-actions",
		"audit.trail",
		"reports",
		"profile",
	],

	FRAUD: [
		"dashboard",
		"audit.logs",
		"audit.flags",
		"audit.assisted-actions",
		"fraud.alerts",
		"fraud.cases",
		"fraud.audit-logs",
		"reports",
		"profile",
	],

	/** KYC verification & compliance — sees only KYC records + basic audit logs */
	KYC_COMPLIANCE: [
		"dashboard",
		"kyc.records",
		"audit.logs",
		"reports",
		"profile",
	],
};

const officerSidebarModules: Record<OfficerDesignationType, string[]> = {
	FULL: officerModuleItems.map((item) => item.moduleKey),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeManagerDesignation(
	value: string | null | undefined,
): ManagerDesignationType {
	const raw = (value ?? "").toUpperCase().trim();

	if (raw in managerSidebarModules) {
		return raw as ManagerDesignationType;
	}

	const aliases: Record<string, ManagerDesignationType> = {
		LOAN_OPS: "LOAN_OPERATIONS",
		"LOAN OPERATIONS": "LOAN_OPERATIONS",
		"LOAN APPROVAL": "LOAN_APPROVAL",
		OPS: "OPERATIONS",
		BANK_OPERATIONS: "OPERATIONS",
		KYC: "KYC_COMPLIANCE",
		"KYC COMPLIANCE": "KYC_COMPLIANCE",
		KYC_MANAGER: "KYC_COMPLIANCE",
	};

	if (aliases[raw]) return aliases[raw];

	// Safe fallback — only dashboard + loan queue + reports + profile.
	// Never "FULL" — that would expose staff/audit/fraud to unrecognized departments.
	return "LOAN_APPROVAL";
}


function normalizeOfficerDesignation(
	_value: string | null | undefined,
): OfficerDesignationType {
	return "FULL";
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export function getHomeByRole(role: AppRole) {
	return roleHome[role];
}

export function getNavByRole(role: AppRole, context?: NavigationContext) {
	if (role === "MANAGER") {
		const resolved = normalizeManagerDesignation(context?.managerDepartment);
		const allowedKeys = new Set(managerSidebarModules[resolved]);

		return managerNavGroups
			.map((group) => ({
				...group,
				items: group.items.filter((item) => allowedKeys.has(item.moduleKey)),
			}))
			.filter((group) =>
				group.items.some((item) => !item.hideFromNav),
			);
	}

	if (role === "OFFICER") {
		const resolved = normalizeOfficerDesignation(context?.officerDesignation);
		const allowedKeys = new Set(officerSidebarModules[resolved]);

		return navByRole.OFFICER.map((group) => ({
			...group,
			items: group.items.filter((item) => allowedKeys.has(item.moduleKey)),
		}));
	}

	return navByRole[role];
}

export function isNavItemActive(pathname: string, item: DashboardNavItem) {
	if (item.moduleKey === "my-loans") {
		if (pathname === "/user/loans") return true;
		if (pathname === "/user/loans/apply") return false;
		return pathname.startsWith("/user/loans/");
	}

	if (item.exactMatch) {
		return pathname === item.href;
	}

	const prefixes = item.matchPrefixes ?? [item.href];

	return prefixes.some((prefix) => {
		if (pathname === prefix) return true;
		return pathname.startsWith(`${prefix}/`);
	});
}

export function getModuleLabel(
	role: AppRole,
	pathname: string,
	context?: NavigationContext,
) {
	const found = getNavByRole(role, context)
		.flatMap((group) => group.items)
		.find((item) => isNavItemActive(pathname, item));

	return found?.label ?? "Dashboard";
}