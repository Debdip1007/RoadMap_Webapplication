@@ .. @@
   topics jsonb DEFAULT '[]'::jsonb,
   goals jsonb DEFAULT '[]'::jsonb,
   deliverables jsonb DEFAULT '[]'::jsonb,
-  references jsonb DEFAULT '[]'::jsonb,
+  reference jsonb DEFAULT '[]'::jsonb,
   created_at timestamptz DEFAULT now(),
   updated_at timestamptz DEFAULT now()
 );