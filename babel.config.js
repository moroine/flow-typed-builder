module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '12.18',
        },
      },
    ],
    '@babel/preset-flow',
  ],
};
