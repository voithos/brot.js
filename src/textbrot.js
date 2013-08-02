#!/usr/bin/env node

var Buddhabrot = require('./buddhabrot');

var textbrot = function(w, h, iterations, max, anti) {
    var buddha = new Buddhabrot(w, h, iterations, max, anti);
    var image = buddha.run();
    drawbrot(w, h, image);
};

var drawbrot = function(w, h, image) {
    // Draw the textual representation of the Buddhabrot
    var row,
        col,
        val,
        index,
        intensity;

    var intensities = [0.05, 0.2, 0.4, 0.6, 0.8];
    var characters = ['  ', '░░', '▒▒', '▓▓', '██'];

    index = 0;
    process.stdout.write('┌' + repeatString('─', w*2) + '┐\n');
    for (row = 0; row < h; row++) {
        process.stdout.write('│');
        for (col = 0; col < w; col++) {
            val = image[index];

            // Determine intensity level
            intensity = 0;
            while (intensity < intensities.length &&
                   val > intensities[intensity]) {
                intensity++;
            }
            intensity = intensity !== 0 ? intensity - 1 : 0;

            process.stdout.write(characters[intensity]);
            index++;
        }
        process.stdout.write('│\n');
    }
    process.stdout.write('└' + repeatString('─', w*2) + '┘\n');
};

var repeatString = function(s, n) {
    n = n || 1;
    return Array(n + 1).join(s);
};

if (require.main === module) {
    var program = require('commander');

    program.version('0.0.1')
        .option('-w, --width <w>', 'Width, in pixels', Number, 50)
        .option('-h, --height <h>', 'Height, in pixels', Number, 50)
        .option('-n, --iterations <n>', 'Number of random iterations', Number, 1000000)
        .option('-m, --max <n>', 'Maximum number of escape calculations', Number, 20)
        .option('-a, --anti', 'Generate anti-Buddhabrot instead of normal')
        .parse(process.argv);

    textbrot(
        program.width,
        program.height,
        program.iterations,
        program.max,
        program.anti);
}

module.exports.textbrot = textbrot;
module.exports.drawbrot = drawbrot;
