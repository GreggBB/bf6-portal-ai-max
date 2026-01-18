/**
 * Example: Generate a Testing Platform
 *
 * This script demonstrates how to use the spatial generator to create
 * an elevated testing platform for Battlefield Portal.
 *
 * Run with: npm run example
 * Or after building: node dist/examples/generate-test-platform.js
 */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createTestingPlatform, SpatialBuilder, validateDocument, validateAndReport, vec3, Elevations, } from '../index.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Output directory (parent of dist/examples)
const outputDir = path.resolve(__dirname, '..', '..', 'output');
/**
 * Example 1: Using the preset function
 */
function generatePresetPlatform() {
    console.log('=== Example 1: Preset Testing Platform ===\n');
    // Create a standard 10x20 testing platform
    const document = createTestingPlatform();
    // Validate
    const validation = validateDocument(document);
    console.log(validateAndReport(document));
    console.log('');
    // Output info
    console.log(`Generated ${document.Portal_Dynamic.length} objects`);
    // Write to file
    const outputPath = path.join(outputDir, 'preset-platform.spatial.json');
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
    console.log(`Written to: ${outputPath}\n`);
}
/**
 * Example 2: Using the builder for custom configuration
 */
function generateCustomPlatform() {
    console.log('=== Example 2: Custom Builder Platform ===\n');
    const builder = new SpatialBuilder()
        .setMapTarget('MP_Abbasid')
        .addFloorGrid({
        origin: vec3(-50, Elevations.Platform, -75),
        tilesX: 15,
        tilesZ: 30,
    })
        .addTeamSpawns({
        spawnCount: 5,
        padding: 8,
    })
        .addCombatArea({
        padding: 15,
    })
        .addSector()
        .addDeployCam();
    const document = builder.build();
    // Validate
    console.log(validateAndReport(document));
    console.log('');
    // Output info
    console.log(`Generated ${document.Portal_Dynamic.length} objects`);
    // Write to file
    const outputPath = path.join(outputDir, 'custom-platform.spatial.json');
    fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
    console.log(`Written to: ${outputPath}\n`);
}
/**
 * Example 3: Small arena platform
 */
function generateArenaPlatform() {
    console.log('=== Example 3: Arena Platform ===\n');
    const document = createTestingPlatform({
        width: 12,
        length: 12,
        spawnsPerTeam: 4,
        elevation: 95, // Slightly higher
    });
    // Validate
    console.log(validateAndReport(document));
    console.log('');
    // Output info
    console.log(`Generated ${document.Portal_Dynamic.length} objects`);
    // Write to file
    const outputPath = path.join(outputDir, 'arena-platform.spatial.json');
    fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
    console.log(`Written to: ${outputPath}\n`);
}
// Run all examples
console.log('Battlefield Portal Spatial Generator - Examples\n');
console.log('================================================\n');
try {
    generatePresetPlatform();
    generateCustomPlatform();
    generateArenaPlatform();
    console.log('================================================');
    console.log('All examples completed successfully!');
    console.log(`Output files are in: ${outputDir}`);
}
catch (error) {
    console.error('Error generating platforms:', error);
    process.exit(1);
}
//# sourceMappingURL=generate-test-platform.js.map