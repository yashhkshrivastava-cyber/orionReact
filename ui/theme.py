"""Orion design system — multicolor palette."""

TEAL = "#249D8F"
GOLD = "#E9C46A"
CORAL = "#E76F51"
CREAM = "#FDF0D5"

CHART_COLORS = [TEAL, GOLD, CORAL, "#1d7f74", "#d4aa4a", "#c45e42"]

CHART_LAYOUT = dict(
    paper_bgcolor="rgba(0,0,0,0)",
    plot_bgcolor="rgba(0,0,0,0)",
    font=dict(family="Inter, system-ui, sans-serif", color="rgba(253,240,213,0.65)", size=12),
    margin=dict(l=16, r=16, t=48, b=16),
    legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
    colorway=CHART_COLORS,
    xaxis=dict(gridcolor="rgba(253,240,213,0.06)", zeroline=False),
    yaxis=dict(gridcolor="rgba(253,240,213,0.06)", zeroline=False),
)

# Core tokens
PRIMARY = TEAL
BG_APP = "#141820"
BG_SURFACE = "#1a2030"
TEXT = CREAM
TEXT_MUTED = "rgba(253, 240, 213, 0.62)"
BORDER = "rgba(253, 240, 213, 0.12)"
TEXT_ON_GOLD = "#1a1f24"

PAGE_EYEBROWS = {
    "default": "Orion Platform",
    "dashboard": "Analytics & insights",
    "data": "Records & operations",
    "admin": "Users & access",
}

PAGE_COLORS = {
    "default": TEAL,
    "dashboard": TEAL,
    "data": GOLD,
    "admin": CORAL,
}

PAGE_GRADIENTS = {
    "default": f"linear-gradient(135deg, {TEAL}, #1d7f74)",
    "dashboard": f"linear-gradient(135deg, {TEAL}, #1d7f74)",
    "data": f"linear-gradient(135deg, {GOLD}, #d4aa4a)",
    "admin": f"linear-gradient(135deg, {CORAL}, #c45e42)",
}

PAGE_BUTTON_TEXT = {
    "default": "#ffffff",
    "dashboard": "#ffffff",
    "data": TEXT_ON_GOLD,
    "admin": "#ffffff",
}

BRAND_GRADIENT = f"linear-gradient(135deg, {TEAL}, {GOLD}, {CORAL})"

WORKSPACE_META = {
    "dashboard": {
        "title": "Dashboard",
        "description": "Live KPIs and charts from ODS clients, cases, and employees.",
    },
    "data": {
        "title": "Data Management",
        "description": "Create and maintain domains, clients, capabilities, and cases.",
    },
    "admin": {
        "title": "Admin Panel",
        "description": "Manage user accounts, roles, and platform access controls.",
    },
}

def page_shadow(color_hex: str, alpha: float = 0.35) -> str:
    """RGBA shadow tuned to a palette color."""
    mapping = {
        TEAL: (36, 157, 143),
        GOLD: (233, 196, 106),
        CORAL: (231, 111, 81),
    }
    r, g, b = mapping.get(color_hex, (36, 157, 143))
    return f"0 4px 14px rgba({r}, {g}, {b}, {alpha})"
