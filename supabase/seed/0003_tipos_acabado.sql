-- Seed inicial de Tipos de Acabado, a partir de lo observado en
-- OrdenesDeServicio.xlsx (Laminados, Barniz UV, Troquelado, Talonarios,
-- Otros: Argollado, Encaratulado, Descolillado). Esta lista es solo el
-- punto de partida: se administra desde Catálogos → Tipos de acabado.

insert into tipos_acabado (codigo, nombre) values
  ('LAM-MATE', 'Laminado Mate'),
  ('LAM-BRI',  'Laminado Brillante'),
  ('BARNIZ',   'Barniz UV'),
  ('TROQ',     'Troquelado'),
  ('TALON',    'Talonarios'),
  ('ARGOLLA',  'Argollado'),
  ('ENCART',   'Encaratulado'),
  ('DESCOL',   'Descolillado')
on conflict (nombre) do nothing;
