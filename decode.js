import { SourceMapConsumer } from 'source-map';
import fs from 'fs';

async function main() {
  const mapContent = fs.readFileSync('dist/assets/index-47SvApAE.js.map', 'utf-8');
  const consumer = await new SourceMapConsumer(mapContent);
  
  // The error was at $g@index-47SvApAE.js:38:17018
  // Line 38, column 17018 (0-indexed)
  let pos = consumer.originalPositionFor({ line: 38, column: 17018 });
  console.log('Position at line 38, col 17018:');
  console.log(JSON.stringify(pos, null, 2));

  // Also try to find what function is at line 38 column 17018
  // Let's also check what's around 17018 in the generated source
  const genContent = fs.readFileSync('dist/assets/index-47SvApAE.js', 'utf-8');
  const lines = genContent.split('\n');
  if (lines.length >= 38) {
    console.log('\nGenerated source around column 17018 on line 38:');
    console.log(lines[37].substring(Math.max(0, 17000), Math.min(lines[37].length, 17200)));
  }

  // Check what source file contributed to this area
  const allPositions = consumer.allGeneratedPositionsFor({ source: pos.source, line: pos.line, column: pos.column });
  if (allPositions) {
    console.log('\nAll generated positions:', JSON.stringify(allPositions.slice(0, 5), null, 2));
  }

  // Also decode VM@index-47SvApAE.js:40:44058
  pos = consumer.originalPositionFor({ line: 40, column: 44058 });
  console.log('\nPosition at line 40, col 44058:');
  console.log(JSON.stringify(pos, null, 2));

  consumer.destroy();
}

main().catch(console.error);
