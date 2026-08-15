"""Entity registry — metadata-driven CRUD definitions."""

ENTITIES = {
    "Business Domain": {
        "table": "orion_ods.business_domain",
        "primary_key": "business_domain_code",
        "display_column": "business_domain_name",
        "form_fields": {
            "business_domain_name": {"label": "Business Domain Name", "type": "text"},
        },
    },
    "Capability": {
        "table": "orion_ods.capability",
        "primary_key": "capability_code",
        "display_column": "capability_name",
        "form_fields": {
            "capability_name": {"label": "Capability Name", "type": "text"},
            "capability_head": {"label": "Capability Head", "type": "text"},
        },
    },
    "Expense Type": {
        "table": "orion_ods.expense_type",
        "primary_key": "expense_type_code",
        "display_column": "expense_type_name",
        "form_fields": {
            "expense_type_name": {"label": "Expense Type Name", "type": "text"},
        },
    },
    "Client": {
        "table": "orion_ods.client",
        "primary_key": "client_code",
        "display_column": "client_name",
        "form_fields": {
            "client_name": {"label": "Client Name", "type": "text"},
            "client_status": {"label": "Status", "type": "select", "options": ["Active", "Inactive"]},
            "client_start_date": {"label": "Start Date", "type": "date"},
            "client_end_date": {"label": "End Date", "type": "date"},
            "client_location_state": {"label": "State", "type": "state"},
            "client_location_city": {
                "label": "City",
                "type": "dependent_select",
                "depends_on": "client_location_state",
            },
            "client_type": {"label": "Client Type", "type": "select", "options": ["Govt", "Private", "MSME"]},
            "firm_priority": {"label": "Priority", "type": "select", "options": ["P1", "P2", "P3"]},
            "client_onboarded": {"label": "Onboarded Date", "type": "date"},
        },
    },
    "Case": {
        "table": "orion_ods.case",
        "primary_key": "case_code",
        "display_column": "case_name",
        "form_fields": {
            "case_name": {"label": "Case Name", "type": "text"},
            "client_code": {
                "label": "Client",
                "type": "select",
                "source_table": "orion_ods.client",
                "source_display_column": "client_name",
                "source_pk_column": "client_code",
            },
            "case_start_date": {"label": "Start Date", "type": "date"},
            "case_status": {"label": "Status", "type": "select", "options": ["Active", "Inactive"]},
            "case_end_date": {"label": "End Date", "type": "date"},
            "capability_code": {
                "label": "Capability",
                "type": "select",
                "source_table": "orion_ods.capability",
                "source_display_column": "capability_name",
                "source_pk_column": "capability_code",
            },
            "monthly_expected_revenue": {"label": "Monthly Expected Revenue", "type": "number"},
            "monthly_allowed_km": {"label": "Monthly Allowed KM", "type": "integer"},
            "business_domain_code": {
                "label": "Business Domain",
                "type": "select",
                "source_table": "orion_ods.business_domain",
                "source_display_column": "business_domain_name",
                "source_pk_column": "business_domain_code",
            },
            "case_onboarded": {"label": "Onboarded", "type": "boolean"},
        },
    },
    "Employee": {
        "table": "orion_ods.employee",
        "primary_key": "employee_code",
        "display_column": "employee_name",
        "form_fields": {
            "employee_name": {"label": "Employee Name", "type": "text"},
            "employee_status": {"label": "Status", "type": "select", "options": ["Active", "Inactive"]},
            "emp_start_date": {"label": "Start Date", "type": "date"},
            "emp_end_date": {"label": "End Date", "type": "date"},
            "employee_type": {
                "label": "Employee Type",
                "type": "select",
                "options": ["Full-time", "Part-time", "Contract", "Intern"],
            },
            "client_facing": {"label": "Client Facing", "type": "boolean"},
            "employee_designation": {"label": "Designation", "type": "text"},
            "manager_code": {
                "label": "Manager",
                "type": "select",
                "source_table": "orion_ods.employee",
                "source_display_column": "employee_name",
                "source_pk_column": "employee_code",
                "optional": True,
            },
            "employee_case_code": {
                "label": "Case",
                "type": "select",
                "source_table": "orion_ods.case",
                "source_display_column": "case_name",
                "source_pk_column": "case_code",
                "optional": True,
            },
        },
    },
}

DW_DIMENSIONS = {
    "Business Domain": {
        "preview_query": """
            SELECT business_domain_sk, business_domain_code, business_domain_name,
                   is_current, is_expired,
                   CASE
                       WHEN is_expired THEN 'Deleted from ODS'
                       WHEN is_current THEN 'Current'
                       ELSE 'Historical'
                   END AS record_status,
                   effective_from,
                   COALESCE(effective_to::TEXT, 'Open') AS effective_to,
                   dw_created_timestamp,
                   dw_last_updated_timestamp
            FROM orion_dw.dim_business_domain
            ORDER BY business_domain_code, effective_from DESC
            LIMIT 50
        """,
    },
}
