module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-tailwindcss'
  ],
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'variants',
          'responsive',
          'screen',
          'layer'
        ]
      }
    ],
    'no-descending-specificity': null,
    'function-no-unknown': [
      true,
      {
        ignoreFunctions: ['theme', 'screen']
      }
    ],
    'color-hex-length': null,
    'color-function-alias-notation': null,
    'color-function-notation': null,
    'alpha-value-notation': null,
    'font-family-name-quotes': null,
    'comment-empty-line-before': null,
    'rule-empty-line-before': null,
    'media-feature-range-notation': null
  }
}
