module.exports = {
  multipass: true,
  floatPrecision: 1,
  plugins: [
    {
      name: 'removeAttrs',
      params: {
        attrs:
          '(color|data|fill-rule|font|maskUnits|opacity|paint|stroke|text).*'
      }
    },
    'convertStyleToAttrs',
    'cleanupListOfValues',
    'removeRasterImages',
    'sortAttrs',
    'removeStyleElement',
    'removeScripts',
    'removeDoctype',
    'removeXMLProcInst',
    'removeComments',
    'removeMetadata',
    'removeEditorsNSData',
    'cleanupAttrs',
    'mergeStyles',
    'inlineStyles',
    'minifyStyles',
    'cleanupIds',
    'removeUselessDefs',
    'cleanupNumericValues',
    'convertColors',
    'removeUnknownsAndDefaults',
    'removeNonInheritableGroupAttrs',
    'removeUselessStrokeAndFill',
    'cleanupEnableBackground',
    'removeHiddenElems',
    'removeEmptyText',
    'convertShapeToPath',
    'convertEllipseToCircle',
    'moveElemsAttrsToGroup',
    'moveGroupAttrsToElems',
    'collapseGroups',
    'convertPathData',
    'convertTransform',
    'removeEmptyAttrs',
    'removeEmptyContainers',
    'mergePaths',
    'removeUnusedNS',
    'sortDefsChildren',
    'removeTitle',
    'removeDesc'
  ]
}
