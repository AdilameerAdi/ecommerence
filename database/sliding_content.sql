-- Create sliding_content table
CREATE TABLE IF NOT EXISTS sliding_content (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index for active content
CREATE INDEX idx_sliding_content_active ON sliding_content(is_active);

-- Add comment for clarity
COMMENT ON TABLE sliding_content IS 'Stores the sliding marquee content for the landing page';
COMMENT ON COLUMN sliding_content.content IS 'The text content to display in the scrolling marquee';
COMMENT ON COLUMN sliding_content.is_active IS 'Whether this content should be displayed';