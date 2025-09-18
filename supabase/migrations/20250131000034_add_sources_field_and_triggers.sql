-- Add sources field to tower_documents table
ALTER TABLE tower_documents 
ADD COLUMN IF NOT EXISTS sources JSONB DEFAULT NULL;

-- Create a function to populate sources data for a tower
CREATE OR REPLACE FUNCTION populate_tower_sources(tower_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    sources_data JSONB := '[]'::jsonb;
    planting_data JSONB;
    vital_data JSONB;
    harvest_data JSONB;
    waste_data JSONB;
    pest_data JSONB;
    photo_data JSONB;
    document_data JSONB;
BEGIN
    -- Get plantings data
    SELECT COALESCE(json_agg(
        json_build_object(
            'id', 'plant-' || id,
            'type', 'plant',
            'title', name,
            'date', to_char(created_at, 'MM/DD/YYYY'),
            'description', CASE WHEN port_number IS NOT NULL THEN 'Port ' || port_number ELSE NULL END
        )
    ), '[]'::json) INTO planting_data
    FROM plantings 
    WHERE tower_id = tower_uuid;
    
    -- Get vitals data
    SELECT COALESCE(json_agg(
        json_build_object(
            'id', 'vital-' || id,
            'type', 'vitals',
            'title', 'pH & EC Reading',
            'date', to_char(created_at, 'MM/DD/YYYY'),
            'description', 'pH: ' || ph || ', EC: ' || ec
        )
    ), '[]'::json) INTO vital_data
    FROM tower_vitals 
    WHERE tower_id = tower_uuid;
    
    -- Get harvests data
    SELECT COALESCE(json_agg(
        json_build_object(
            'id', 'harvest-' || id,
            'type', 'harvest',
            'title', COALESCE(plant_name, 'Plant') || ' Harvest',
            'date', to_char(created_at, 'MM/DD/YYYY'),
            'description', weight_grams || 'g' || CASE WHEN destination IS NOT NULL THEN ' → ' || destination ELSE '' END
        )
    ), '[]'::json) INTO harvest_data
    FROM harvests 
    WHERE tower_id = tower_uuid;
    
    -- Get waste data
    SELECT COALESCE(json_agg(
        json_build_object(
            'id', 'waste-' || id,
            'type', 'waste',
            'title', COALESCE(plant_name, 'Plant') || ' Waste',
            'date', to_char(created_at, 'MM/DD/YYYY'),
            'description', grams || 'g - ' || COALESCE(notes, 'No notes')
        )
    ), '[]'::json) INTO waste_data
    FROM waste 
    WHERE tower_id = tower_uuid;
    
    -- Get pest data
    SELECT COALESCE(json_agg(
        json_build_object(
            'id', 'pest-' || id,
            'type', 'pest',
            'title', 'Pest Observation',
            'date', to_char(created_at, 'MM/DD/YYYY'),
            'description', LEFT(pest, 50) || CASE WHEN LENGTH(pest) > 50 THEN '...' ELSE '' END
        )
    ), '[]'::json) INTO pest_data
    FROM pest_logs 
    WHERE tower_id = tower_uuid;
    
    -- Get photos data
    SELECT COALESCE(json_agg(
        json_build_object(
            'id', 'photo-' || id,
            'type', 'photo',
            'title', 'Tower Photo',
            'date', to_char(created_at, 'MM/DD/YYYY'),
            'description', COALESCE(caption, 'No description')
        )
    ), '[]'::json) INTO photo_data
    FROM tower_photos 
    WHERE tower_id = tower_uuid;
    
    -- Get documents data
    SELECT COALESCE(json_agg(
        json_build_object(
            'id', 'doc-' || id,
            'type', 'document',
            'title', title,
            'date', to_char(created_at, 'MM/DD/YYYY'),
            'description', COALESCE(description, file_name)
        )
    ), '[]'::json) INTO document_data
    FROM tower_documents 
    WHERE tower_id = tower_uuid;
    
    -- Combine all sources
    sources_data := planting_data || vital_data || harvest_data || waste_data || pest_data || photo_data || document_data;
    
    RETURN sources_data;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger function to automatically update sources when data changes
CREATE OR REPLACE FUNCTION update_tower_sources()
RETURNS TRIGGER AS $$
DECLARE
    tower_uuid UUID;
    sources_data JSONB;
BEGIN
    -- Get the tower_id from the changed record
    IF TG_OP = 'DELETE' THEN
        tower_uuid := OLD.tower_id;
    ELSE
        tower_uuid := NEW.tower_id;
    END IF;
    
    -- Get updated sources data
    sources_data := populate_tower_sources(tower_uuid);
    
    -- Update the sources field in tower_documents (or create a record if none exists)
    INSERT INTO tower_documents (tower_id, teacher_id, title, file_name, file_path, file_url, file_size, file_type, sources)
    SELECT tower_uuid, teacher_id, 'Sources Data', 'sources.json', 'sources/sources.json', 'data:sources', 0, 'application/json', sources_data
    FROM towers WHERE id = tower_uuid
    ON CONFLICT (tower_id) 
    DO UPDATE SET sources = sources_data, updated_at = NOW();
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers on all related tables
CREATE TRIGGER update_sources_on_plantings_change
    AFTER INSERT OR UPDATE OR DELETE ON plantings
    FOR EACH ROW EXECUTE FUNCTION update_tower_sources();

CREATE TRIGGER update_sources_on_vitals_change
    AFTER INSERT OR UPDATE OR DELETE ON tower_vitals
    FOR EACH ROW EXECUTE FUNCTION update_tower_sources();

CREATE TRIGGER update_sources_on_harvests_change
    AFTER INSERT OR UPDATE OR DELETE ON harvests
    FOR EACH ROW EXECUTE FUNCTION update_tower_sources();

CREATE TRIGGER update_sources_on_waste_change
    AFTER INSERT OR UPDATE OR DELETE ON waste
    FOR EACH ROW EXECUTE FUNCTION update_tower_sources();

CREATE TRIGGER update_sources_on_pest_logs_change
    AFTER INSERT OR UPDATE OR DELETE ON pest_logs
    FOR EACH ROW EXECUTE FUNCTION update_tower_sources();

CREATE TRIGGER update_sources_on_photos_change
    AFTER INSERT OR UPDATE OR DELETE ON tower_photos
    FOR EACH ROW EXECUTE FUNCTION update_tower_sources();

CREATE TRIGGER update_sources_on_documents_change
    AFTER INSERT OR UPDATE OR DELETE ON tower_documents
    FOR EACH ROW EXECUTE FUNCTION update_tower_sources();
