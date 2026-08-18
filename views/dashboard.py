import pandas as pd
import plotly.express as px
import streamlit as st

from db.dashboard import get_dashboard_data
from ui.styles import back_button, page_header, render_metric_card, section_title
from ui.theme import CHART_COLORS, CHART_LAYOUT


def _apply_chart_theme(fig):
    fig.update_layout(**CHART_LAYOUT)
    return fig


def _chart_block(title, fig):
    with st.container(border=True):
        section_title(title)
        st.plotly_chart(_apply_chart_theme(fig), use_container_width=True)


def _empty_block(title, message="No records in ODS yet."):
    with st.container(border=True):
        section_title(title)
        st.caption(message)


def render_dashboard():
    if back_button():
        st.session_state.page = "home"
        st.rerun()

    page_header(
        "Command Center",
        "Live counts and totals from orion_ods — no placeholder values",
        theme_key="dashboard",
    )

    data = get_dashboard_data()

    section_title("Key Metrics")
    metric_cols = st.columns(6)
    for col, metric in zip(metric_cols, data["metrics"]):
        with col:
            render_metric_card(metric["label"], metric["value"])

    st.markdown("<div style='height: 1rem;'></div>", unsafe_allow_html=True)

    col1, col2 = st.columns(2)

    with col1:
        if data["clients_by_status"]:
            fig = px.pie(
                pd.DataFrame(data["clients_by_status"]),
                names="type",
                values="count",
                hole=0.65,
                color_discrete_sequence=[CHART_COLORS[3], CHART_COLORS[5]],
            )
            fig.update_traces(textposition="inside", textinfo="percent+label")
            fig.update_layout(title=None)
            _chart_block("Clients by status", fig)
        else:
            _empty_block("Clients by status")

    with col2:
        if data["clients_by_type"]:
            fig = px.bar(
                pd.DataFrame(data["clients_by_type"]),
                x="type",
                y="count",
                color="type",
                color_discrete_sequence=CHART_COLORS,
            )
            fig.update_layout(title=None, showlegend=False)
            _chart_block("Clients by type", fig)
        else:
            _empty_block("Clients by type")

    col1, col2 = st.columns(2)

    with col1:
        if data["headcount"]:
            fig = px.pie(
                pd.DataFrame(data["headcount"]),
                names="type",
                values="count",
                hole=0.65,
                color_discrete_sequence=[CHART_COLORS[3], CHART_COLORS[5]],
            )
            fig.update_traces(textposition="inside", textinfo="percent+label")
            fig.update_layout(title=None)
            _chart_block("Headcount distribution", fig)
        else:
            _empty_block("Headcount distribution")

    with col2:
        if data["cases_by_domain"]:
            fig = px.bar(
                pd.DataFrame(data["cases_by_domain"]),
                x="domain",
                y="count",
                color="domain",
                color_discrete_sequence=CHART_COLORS,
            )
            fig.update_layout(title=None, showlegend=False)
            _chart_block("Cases by business domain", fig)
        else:
            _empty_block("Cases by business domain")

    if data["case_revenue"]:
        case_rev = pd.DataFrame(data["case_revenue"])
        fig = px.bar(
            case_rev,
            x="case",
            y="revenue",
            color="revenue",
            color_continuous_scale=[[0, CHART_COLORS[0]], [1, CHART_COLORS[2]]],
        )
        fig.update_layout(title=None, coloraxis_showscale=False)
        _chart_block("Case-wise expected monthly revenue", fig)
    else:
        _empty_block("Case-wise expected monthly revenue")

    section_title("Performance Snapshot")
    snap_cols = st.columns(3)
    for col, item in zip(snap_cols, data["snapshot"]):
        with col:
            render_metric_card(item["label"], item["value"])
