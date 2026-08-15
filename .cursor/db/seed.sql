-- Seed reference data for local development so dropdowns and previews are populated.
-- Idempotent: only inserts when the tables are empty.

INSERT INTO orion_ods.business_domain (business_domain_name)
SELECT v FROM (VALUES ('Banking'), ('Healthcare'), ('Retail')) AS s(v)
WHERE NOT EXISTS (SELECT 1 FROM orion_ods.business_domain);

INSERT INTO orion_ods.capability (capability_name, capability_head)
SELECT v, h FROM (VALUES
    ('Data Engineering', 'Asha Rao'),
    ('Analytics', 'Vikram Singh')
) AS s(v, h)
WHERE NOT EXISTS (SELECT 1 FROM orion_ods.capability);

INSERT INTO orion_ods.client (
    client_name, client_status, client_location_state, client_location_city,
    client_type, firm_priority, client_onboarded
)
SELECT n, st, stt, ct, tp, pr, ob FROM (VALUES
    ('Acme Corp', 'Active', 'Maharashtra', 'Mumbai',    'Private', 'P1', CURRENT_DATE),
    ('Globex',    'Active', 'Karnataka',   'Bangalore', 'Govt',    'P2', NULL::date)
) AS s(n, st, stt, ct, tp, pr, ob)
WHERE NOT EXISTS (SELECT 1 FROM orion_ods.client);

INSERT INTO orion_ods.expense_type (expense_type_name, created_timestamp)
SELECT v, ts FROM (VALUES
    ('Travel', TIMESTAMPTZ '2026-01-10 10:00:00+00'),
    ('Software', TIMESTAMPTZ '2026-02-15 10:00:00+00'),
    ('Hardware', TIMESTAMPTZ '2026-03-20 10:00:00+00')
) AS s(v, ts)
WHERE NOT EXISTS (SELECT 1 FROM orion_ods.expense_type);

INSERT INTO orion_ods.case (
    case_name, client_code, case_start_date, case_status,
    capability_code, monthly_expected_revenue, monthly_allowed_km,
    business_domain_code, case_onboarded
)
SELECT
    c.case_name,
    cl.client_code,
    c.case_start_date,
    c.case_status,
    cap.capability_code,
    c.monthly_expected_revenue,
    c.monthly_allowed_km,
    bd.business_domain_code,
    c.case_onboarded
FROM (VALUES
    ('Acme Analytics', 'Acme Corp', DATE '2026-01-15', 'Active', 'Data Engineering', 450000, 120, 'Banking', TRUE),
    ('Globex Migration', 'Globex', DATE '2026-02-01', 'Active', 'Analytics', 320000, 80, 'Healthcare', TRUE),
    ('Retail Insights', 'Acme Corp', DATE '2026-03-10', 'Active', 'Analytics', 180000, 60, 'Retail', FALSE),
    ('Legacy Support', 'Globex', DATE '2026-04-05', 'Inactive', 'Data Engineering', 90000, 40, 'Banking', TRUE)
) AS c(case_name, client_name, case_start_date, case_status, capability_name, monthly_expected_revenue, monthly_allowed_km, domain_name, case_onboarded)
JOIN orion_ods.client cl ON cl.client_name = c.client_name
JOIN orion_ods.capability cap ON cap.capability_name = c.capability_name
JOIN orion_ods.business_domain bd ON bd.business_domain_name = c.domain_name
WHERE NOT EXISTS (SELECT 1 FROM orion_ods.case);

INSERT INTO orion_ods.employee (
    employee_name, employee_status, emp_start_date,
    employee_type, client_facing, employee_designation, employee_case_code
)
SELECT
    e.employee_name,
    e.employee_status,
    e.emp_start_date,
    e.employee_type,
    e.client_facing,
    e.employee_designation,
    cs.case_code
FROM (VALUES
    ('Priya Sharma', 'Active', DATE '2025-06-01', 'Full-time', TRUE, 'Senior Consultant', 'Acme Analytics'),
    ('Rahul Mehta', 'Active', DATE '2025-09-15', 'Full-time', TRUE, 'Data Engineer', 'Globex Migration'),
    ('Anita Desai', 'Active', DATE '2026-01-20', 'Contract', FALSE, 'Analyst', 'Retail Insights'),
    ('Vikram Singh', 'Inactive', DATE '2024-03-01', 'Full-time', TRUE, 'Manager', 'Legacy Support')
) AS e(employee_name, employee_status, emp_start_date, employee_type, client_facing, employee_designation, case_name)
LEFT JOIN orion_ods.case cs ON cs.case_name = e.case_name
WHERE NOT EXISTS (SELECT 1 FROM orion_ods.employee);
