ALTER TABLE public.mind_dumps
ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}'::text[];
