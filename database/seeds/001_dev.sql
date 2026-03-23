-- Dev seed: one hospital, cashier (password: changeme), sample services.
-- Password hash generated with bcrypt cost 10 for the string "changeme".

INSERT INTO hospitals (id, name, location)
VALUES (
  'a0000000-0000-4000-8000-000000000001',
  'Apollo Multispecialty',
  'Ward B'
);

INSERT INTO cashiers (id, hospital_id, name, email, password_hash)
VALUES (
  'b0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000001',
  'Priya Menon',
  'cashier@insurexp.local',
  '$2b$10$RJ8SAQMHBibtMKNFgPc1SeAlNNmyDzMLMozbpcnhnfSgtDUKJaI9i'
);

INSERT INTO services (id, hospital_id, name, category, price)
VALUES
  ('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Consultation', 'consultation', 1500.00),
  ('c0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Lab - CBC Test', 'lab', 850.00),
  ('c0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'Medication - Paracetamol', 'medication', 120.00);

INSERT INTO patients (id, name, insurance_id)
VALUES (
  'd0000000-0000-4000-8000-000000000001',
  'Rahul Sharma',
  'INS-00421'
);
