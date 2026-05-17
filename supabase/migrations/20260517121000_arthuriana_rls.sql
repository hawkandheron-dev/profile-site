-- RLS: public read-only for all Arthuriana tables

ALTER TABLE "AR_Realms"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AR_Characters" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AR_Relations"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AR_Sources"    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON "AR_Realms"     FOR SELECT USING (true);
CREATE POLICY "Public read" ON "AR_Characters" FOR SELECT USING (true);
CREATE POLICY "Public read" ON "AR_Relations"  FOR SELECT USING (true);
CREATE POLICY "Public read" ON "AR_Sources"    FOR SELECT USING (true);
