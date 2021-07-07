module.exports = {
  'presets': [
    '@babel/preset-env',
    [
      '@babel/preset-react', {
        'runtime': 'automatic',
      },
    ],
  ],
  'plugins': [
    ['@babel/plugin-proposal-decorators', { 'legacy': true }],
    ['@babel/plugin-proposal-class-properties', { 'loose': true }],
    ['@babel/plugin-proposal-private-methods', { 'loose': true }],
    '@babel/plugin-transform-runtime',
  ],
};
