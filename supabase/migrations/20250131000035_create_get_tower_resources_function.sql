-- Create the get_tower_resources function with sources field
CREATE OR REPLACE FUNCTION public.get_tower_resources(p_tower_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'tower_id', t.id,

    'harvests', (
      SELECT COALESCE(jsonb_agg(h.*), '[]'::jsonb)
      FROM harvests h
      WHERE h.tower_id = t.id
    ),

    'pest_logs', (
      SELECT COALESCE(jsonb_agg(p.*), '[]'::jsonb)
      FROM pest_logs p
      WHERE p.tower_id = t.id
    ),

    'plantings', (
      SELECT COALESCE(jsonb_agg(pl.*), '[]'::jsonb)
      FROM plantings pl
      WHERE pl.tower_id = t.id
    ),

    'tower_documents', (
      SELECT COALESCE(jsonb_agg(td.*), '[]'::jsonb)
      FROM tower_documents td
      WHERE td.tower_id = t.id
    ),

    'tower_photos', (
      SELECT COALESCE(jsonb_agg(tp.*), '[]'::jsonb)
      FROM tower_photos tp
      WHERE tp.tower_id = t.id
    ),

    'tower_vitals', (
      SELECT COALESCE(jsonb_agg(tv.*), '[]'::jsonb)
      FROM tower_vitals tv
      WHERE tv.tower_id = t.id
    ),

    'waste_logs', (
      SELECT COALESCE(jsonb_agg(w.*), '[]'::jsonb)
      FROM waste_logs w
      WHERE w.tower_id = t.id
    ),

    'sources', (
      SELECT COALESCE(jsonb_agg(source_item), '[]'::jsonb)
      FROM (
        -- Plantings as sources
        SELECT jsonb_build_object(
          'id', 'plant-' || id,
          'type', 'plant',
          'title', name,
          'date', to_char(created_at, 'MM/DD/YYYY'),
          'description', CASE WHEN port_number IS NOT NULL THEN 'Port ' || port_number ELSE NULL END
        ) as source_item
        FROM plantings pl
        WHERE pl.tower_id = t.id
        
        UNION ALL
        
        -- Vitals as sources
        SELECT jsonb_build_object(
          'id', 'vital-' || id,
          'type', 'vitals',
          'title', 'pH & EC Reading',
          'date', to_char(created_at, 'MM/DD/YYYY'),
          'description', 'pH: ' || ph || ', EC: ' || ec
        ) as source_item
        FROM tower_vitals tv
        WHERE tv.tower_id = t.id
        
        UNION ALL
        
        -- Harvests as sources
        SELECT jsonb_build_object(
          'id', 'harvest-' || id,
          'type', 'harvest',
          'title', COALESCE(plant_name, 'Plant') || ' Harvest',
          'date', to_char(created_at, 'MM/DD/YYYY'),
          'description', weight_grams || 'g' || CASE WHEN destination IS NOT NULL THEN ' → ' || destination ELSE '' END
        ) as source_item
        FROM harvests h
        WHERE h.tower_id = t.id
        
        UNION ALL
        
        -- Waste logs as sources
        SELECT jsonb_build_object(
          'id', 'waste-' || id,
          'type', 'waste',
          'title', COALESCE(plant_name, 'Plant') || ' Waste',
          'date', to_char(created_at, 'MM/DD/YYYY'),
          'description', grams || 'g - ' || COALESCE(notes, 'No notes')
        ) as source_item
        FROM waste_logs w
        WHERE w.tower_id = t.id
        
        UNION ALL
        
        -- Pest logs as sources
        SELECT jsonb_build_object(
          'id', 'pest-' || id,
          'type', 'pest',
          'title', 'Pest Observation',
          'date', to_char(created_at, 'MM/DD/YYYY'),
          'description', LEFT(pest, 50) || CASE WHEN LENGTH(pest) > 50 THEN '...' ELSE '' END
        ) as source_item
        FROM pest_logs p
        WHERE p.tower_id = t.id
        
        UNION ALL
        
        -- Photos as sources
        SELECT jsonb_build_object(
          'id', 'photo-' || id,
          'type', 'photo',
          'title', 'Tower Photo',
          'date', to_char(created_at, 'MM/DD/YYYY'),
          'description', COALESCE(caption, 'No description')
        ) as source_item
        FROM tower_photos tp
        WHERE tp.tower_id = t.id
        
        UNION ALL
        
        -- Documents as sources
        SELECT jsonb_build_object(
          'id', 'doc-' || id,
          'type', 'document',
          'title', title,
          'date', to_char(created_at, 'MM/DD/YYYY'),
          'description', COALESCE(description, file_name)
        ) as source_item
        FROM tower_documents td
        WHERE td.tower_id = t.id
      ) all_sources
      ORDER BY source_item->>'date' DESC
    )
  )
  INTO result
  FROM towers t
  WHERE t.id = p_tower_id;

  RETURN result;
END;
$$;
