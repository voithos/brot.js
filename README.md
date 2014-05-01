# brot.js
##### A Buddhabrot generator using HTML5 http://voithos.github.io/brot.js/

![Buddhabrot](https://raw.github.com/voithos/brot.js/master/assets/brotjs.png)

## Intro

The [Mandelbrot set](http://en.wikipedia.org/wiki/Mandelbrot_set) is a set of
points in the complex plane that satisfy a certain property, namely that the
repeated application of the formula

![Mandelbrot set equation](http://upload.wikimedia.org/math/1/6/8/1686ce42df2b6ee51a3ae880613ca4d9.png)

remains bounded (i.e. does not escape towards positive or negative infinity),
where _z<sub>0</sub>_ is 0 and _c_ is the point on the complex plane.

The fractal image of the Mandelbrot set is easily recognizable to most, but
perhaps less well-known is the so-called Buddhabrot.

The [Buddhabrot](http://en.wikipedia.org/wiki/Buddhabrot) is an alternative
rendering technique which results in some very interesting and beautiful forms.
Discovered in 1993 by [Melinda Green](http://www.superliminal.com/fractals/bbrot/bbrot.htm),
the Buddhabrot displays the paths of escaping points as they, eventually,
proceed towards infinity. The frequency of visits per point is kept track of,
and used to compute the final intensity for the pixel.

By altering the maximum number of iterations that are done before a point is
considered to be part of the Mandelbrot set (thus bounded, and excluded from
the Buddhabrot image), different resulting forms arise. If the maximum is
raised, the results highlight certain sparse and detailed areas of the complex
plane. A few points which, at a lower maximum setting, would have been excluded
from the image, are maintained along with the vast number of pixels that they
visit in their escape trajectories. This causes the visited pixels to greatly
increase in their hit counts and become more prominent.

## Things to Try

The `brot.js` interface contains controls that can be used to change properties
of the renderings. Here are a few things you should try:

- Modify `maxEscapeIter` to change the maximum escape threshold. This will
  yield a diverse number of resulting images. Note that the value on the
  control is on a logarithmic scale and thus does not reflect the actual
  maximum iteration count. The actual count is closer to `2^(n / 2)` where `n`
  is the value of the control.

- Lower the `batchSize` property to improve responsiveness, or increase it to
  calculate more points per timestep.

- Toggle `anti` to change the criteria for inclusion in the final image.
  Whereas the standard Buddhabrot plots the paths of points that *aren't* in
  the Mandelbrot set, the so-called Anti-Buddhabrot plots points that *are* in
  the set.

- Toggle `sqrtNormalize` to use the square roots of hit counts when calculating
  the normalizer. This balances the lower-intensity pixels somewhat, and allows
  you to see some detail in saturated areas without losing all detail in less
  intense areas.

- Toggle `autoNormalize` and manually adjust the normalizer to brighten or dim
  the intensity of the image. When `autoNormalize` is turned on, the pixel with
  the highest hit count is fully saturated, while all other pixels are
  saturated in proportion to their hit counts.

- Add multiple Buddhabrot layers and tweak their parameters to form a composite
  image. Set their colors to an interesting mix (e.g. RGB, CMY) and the
  resulting image will have different "frequencies" of the Buddhabrot mapped to
  different "color channels," mimicking the techniques used by astronomers to
  compose multiple images of different wavelengths. The resulting image is
  known as a Nebulabrot.

## Open Source

Thanks goes to the following projects and platforms that were used:

- dat.GUI
- Grunt
- HTML5 and the web platform
