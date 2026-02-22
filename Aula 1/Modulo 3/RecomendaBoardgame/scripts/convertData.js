const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Read the CSV file
const csvPath = path.join(__dirname, '../dados/raw_data.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true
});

// Extract relevant features for the model
const processedData = records.map((record, index) => {
  // Extract numeric features for training
  const features = [
    parseFloat(record.min_players) || 0,
    parseFloat(record.max_players) || 0,
    parseFloat(record.min_playtime) || 0,
    parseFloat(record.max_playtime) || 0,
    parseFloat(record.playing_time) || 0,
    parseFloat(record.min_age) || 0,
    parseFloat(record.complexity_rating) || 0,
    parseFloat(record.user_ratings) || 0,
    parseFloat(record.user_comments) || 0,
    parseFloat(record.year) || 0,
    parseFloat(record.average_rating) || 0,
  ];

  // Normalize some features
  const normalizedFeatures = [
    features[0] / 10,  // min_players
    features[1] / 10,  // max_players
    features[2] / 300, // min_playtime
    features[3] / 300, // max_playtime
    features[4] / 300, // playing_time
    features[5] / 20,  // min_age
    features[6] / 5,   // complexity_rating
    Math.log(features[7] + 1) / 15, // user_ratings (log scale)
    Math.log(features[8] + 1) / 15, // user_comments (log scale)
    (features[9] - 1950) / 80, // year (normalized from 1950-2030)
    features[10] / 10, // average_rating
  ];

  return {
    id: index,
    nome_do_jogo: record.name,
    description: record.description || '',
    designer: record.designer || '',
    year: record.year || '',
    category: record.category || '',
    mechanism: record.mechanism || '',
    average_rating: record.average_rating || '',
    complexity_rating: record.complexity_rating || '',
    features: normalizedFeatures,
    raw_features: features
  };
});

// Ensure public/data directory exists
const outputDir = path.join(__dirname, '../public/data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write JSON file
const outputPath = path.join(outputDir, 'raw_data.json');
fs.writeFileSync(outputPath, JSON.stringify(processedData, null, 2));

console.log(`✅ Converted ${processedData.length} games to JSON format`);
console.log(`📁 Output: ${outputPath}`);
