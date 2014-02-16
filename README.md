# brot.js
##### A Buddhabrot generator using HTML5 http://voithos.github.io/brot.js/

## Intro

The [Mandelbrot set](http://en.wikipedia.org/wiki/Mandelbrot_set) is a set of
points in the complex plain that satisfy a certain property, namely that the
repeated application of the formula

![Mandelbrot set equation](http://www.sciweavers.org/tex2img.php?eq=z_%7Bn%2B1%7D%20%3D%20z%5E2_n%20%2B%20c&bc=White&fc=Black&im=png&fs=12&ff=fourier&edit=0)

remains bounded (i.e. does not escape towards positive or negative infinity),
where _z<sub>0</sub>_ is 0 and _c_ is the point on the complex plain.

The fractal image of the Mandelbrot set is easily recognizable to most, but
perhaps less well-known is the so-called Buddhabrot.

The [Buddhabrot](http://en.wikipedia.org/wiki/Buddhabrot) is an alternative
rendering technique which results in some very interesting and beautiful forms.
Discovered in 1993 by [MelindaGreen](http://www.superliminal.com/fractals/bbrot/bbrot.htm),
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

## Open Source
