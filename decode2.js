import { SourceMapConsumer } from 'source-map';
import fs from 'fs';

async function main() {
  const mapContent = fs.readFileSync('dist/assets/index-47SvApAE.js.map', 'utf-8');
  const consumer = await new SourceMapConsumer(mapContent);
  
  // Get the full generated source
  const genContent = fs.readFileSync('dist/assets/index-47SvApAE.js', 'utf-8');
  
  // Find the function boundaries around line 38, col 17018
  // Line 38 (0-indexed: 37)
  const lines = genContent.split('\n');
  const targetLine = lines[37];
  
  // Find what function name is at this position by looking backward for 'function' keyword
  // But the code is minified so function names are like $g, $h, etc.
  // Let's try to find Text( calls near this area
  const area = targetLine.substring(Math.max(0, 16900), Math.min(targetLine.length, 17400));
  console.log('=== Area around column 17018 ===');
  console.log(area);
  console.log('');
  
  // Search for "Text" in a wider area
  const wider = targetLine.substring(Math.max(0, 16000), Math.min(targetLine.length, 20000));
  const textMatches = wider.match(/[^a-zA-Z]Text[^a-zA-Z]?\(/g);
  if (textMatches) {
    console.log('=== Text( occurrences near col 17018 ===');
    console.log(textMatches);
  } else {
    console.log('No Text( found in vicinity');
  }

  // Now let's also search the ENTIRE bundle for places where Text appears as a constructor call
  // without the new keyword
  // Find all "=Text(" or "return Text(" or "(0,Text)(" or similar patterns
  const allTextCalls = genContent.match(/[=,(]\s*Text\s*\(/g);
  if (allTextCalls) {
    console.log('\n=== All Text() call patterns ===');
    console.log(allTextCalls.slice(0, 20));
  }

  consumer.destroy();
}

main().catch(console.error);
